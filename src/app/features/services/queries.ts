"use client";

import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { itemSchema, createItemDtoSchema, updateItemDtoSchema, UpdateItemDto } from "../model/schemas";

/* ========= 목록 응답(축약형) 스키마: 중앙 스키마에서 pick ========= */
const listEntrySchema = itemSchema.pick({ id: true, name: true, isCompleted: true });
const listSchema = listEntrySchema.array();

/* ========= HTTP 유틸 ========= */
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, { cache: "no-store", ...init });
  const ct = res.headers.get("content-type") ?? "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`HTTP ${res.status} ${res.statusText} ${msg}`);
  }
  return body as T;
}

/* ========= Query Keys ========= */
export const itemsKeys = {
  root: (tenantId: string) => ["items", tenantId] as const,
  list: (tenantId: string, page: number, size: number) =>
    [...itemsKeys.root(tenantId), "list", page, size] as const,
  detail: (tenantId: string, id: number | string) =>
    [...itemsKeys.root(tenantId), "detail", id] as const,
};

/* ========= 순수 API ========= */
async function listItems(tenantId: string, page = 1, pageSize = 10) {
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString();
  const raw = await fetchJson<unknown>(`/api/${tenantId}/items?${qs}`);
  return listSchema.parse(raw);
}

async function getItem(tenantId: string, itemId: number | string) {
  const raw = await fetchJson<unknown>(`/api/${tenantId}/items/${itemId}`);
  return itemSchema.parse(raw);
}

async function postItem(tenantId: string, dto: { name: string }) {
  const body = createItemDtoSchema.parse(dto);
  const raw = await fetchJson<unknown>(`/api/${tenantId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return itemSchema.parse(raw);
}


async function patchItem(
    tenantId: string,
    itemId: number | string,
    dto: UpdateItemDto
  ) {
    const body = updateItemDtoSchema.parse(dto); 
    const raw = await fetchJson<unknown>(`/api/${tenantId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return itemSchema.parse(raw);
  }

async function deleteItem(tenantId: string, itemId: number | string) {
  await fetchJson<void>(`/api/${tenantId}/items/${itemId}`, { method: "DELETE" });
}

// 파일명/크기 검증
function validateImage(file: File) {
    if (!/^[\x00-\x7F]+$/.test(file.name)) {
      throw new Error("이미지 파일명은 영문만 허용됩니다.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("파일 크기는 5MB 이하여야 합니다.");
    }
  }
  
  async function uploadImage(tenantId: string, file: File) {
    validateImage(file);
    const form = new FormData();
    form.append("image", file); 
  
    const { url } = await fetchJson<{ url: string }>(`/api/${tenantId}/images/upload`, {
      method: "POST",
      body: form,
    });
    return url; 
  }
    

export function getTodos(tenantId: string, page = 1, pageSize = 100) {
  return useQuery(
    queryOptions({
      queryKey: itemsKeys.list(tenantId, page, pageSize),
      queryFn: () => listItems(tenantId, page, pageSize),
    })
  );
}

export function getTodo(tenantId: string, itemId?: number | string) {
  return useQuery(
    queryOptions({
      queryKey: itemId ? itemsKeys.detail(tenantId, itemId) : [...itemsKeys.root(tenantId), "detail", "nil"],
      queryFn: () => getItem(tenantId, itemId as number | string),
      enabled: !!itemId,
    })
  );
}

export function postTodo(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string }) => postItem(tenantId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemsKeys.root(tenantId) }),
  });
}

export function patchTodo(tenantId: string) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (vars: { id: number | string; dto: UpdateItemDto }) =>
        patchItem(tenantId, vars.id, vars.dto),
      onSuccess: (_data, vars) => {
        qc.invalidateQueries({ queryKey: itemsKeys.root(tenantId) });
        qc.invalidateQueries({ queryKey: itemsKeys.detail(tenantId, vars.id) });
      },
    });
  }
export function deleteTodo(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number | string) => deleteItem(tenantId, itemId),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: itemsKeys.root(tenantId) });
      qc.removeQueries({ queryKey: itemsKeys.detail(tenantId, id) });
    },
  });
}

export function useUploadImage(tenantId: string) {
    return useMutation({
      mutationFn: (file: File) => uploadImage(tenantId, file),
    });
  }