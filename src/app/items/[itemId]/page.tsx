"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TENANT_ID } from "@/app/features/model/types";
import { useUploadImage, useGetTodo, usePatchTodo, useDeleteTodo } from "@/app/features/services/queries";

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const id = Number(itemId);
  const router = useRouter();

  const { data, isLoading } = useGetTodo(TENANT_ID, id);
  const updateItem = usePatchTodo(TENANT_ID);
  const deleteItem = useDeleteTodo(TENANT_ID);
  const upload = useUploadImage(TENANT_ID);

  const [name, setName] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [memo, setMemo] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setIsCompleted(data.isCompleted);
      setMemo(data.memo ?? "");
      setImageUrl(data.imageUrl ?? null);
    }
  }, [data]);

  const isDirty =
  name !== (data?.name ?? "") ||
  memo !== (data?.memo ?? "") ||
  imageUrl !== (data?.imageUrl ?? null) ||
  isCompleted !== (data?.isCompleted ?? false);

  if (isLoading) return <p>로딩중…</p>;


  const onPickImage = () => fileInputRef.current?.click();

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    upload.mutate(f, {
      onSuccess: (url) => {
        setImageUrl(url);
      },
      onError: (err) => {
        alert((err as Error).message);
        e.target.value = "";
      },
    });
  };

  const handleSave = () => {
    const nm = name.trim();

    const dto = {
      isCompleted,
      ...(nm ? { name: nm } : {}),
      ...(memo !== undefined ? { memo } : {}),
      ...(imageUrl ? { imageUrl } : {}),   
    };

    updateItem.mutate(
      { id, dto },
      {
        onSuccess: () => {
          alert("수정 완료");
          router.push("/");
        },
        onError: (e) => alert((e as Error).message),
      }
    );
  };

  const handleDelete = () => {
    if (!confirm("삭제하시겠습니까?")) return;
    deleteItem.mutate(id, {
      onSuccess: () => {
        alert("삭제 완료");
        router.push("/");
      },
      onError: (e) => alert((e as Error).message),
    });
  };

  return (
<div className="space-y-6 bg-white">
  {/* 상단 토글/제목 바 */}
  <div
    className={`w-full h-16 flex items-center justify-center gap-3 rounded-3xl border-[2px] border-slate-900 px-4 ${
      isCompleted ? "bg-violet-100" : "bg-white"
    }`}
  >
    <button type="button" onClick={() => setIsCompleted((v) => !v)} className="cursor-pointer">
      <img src={isCompleted ? "/check.svg" : "/empty-check.svg"} alt="check" />
    </button>
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      className={`font-semibold outline-none bg-transparent ${
        isCompleted ? "line-through text-slate-500" : "text-slate-900"
      }`}
      placeholder="제목을 입력하세요"
    />
  </div>

  <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start">

    <div className="h-[311px] relative rounded-[20px] border-2 border-dashed border-slate-300 bg-slate-50/60 grid place-items-center overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt="이미지" className="object-contain h-full " />
      ) : (
        <div className="text-slate-400 flex flex-col items-center gap-2">
          <img src="/empty-img.svg" alt="" />
        </div>
      )}

      <button
        type="button"
        onClick={onPickImage}
        disabled={upload.isPending}
        className="absolute bottom-3 right-3 h-10 w-10 cursor-pointer"
      >
        {imageUrl ? <img src="/edit-img.svg" alt="" /> : <img src="/add-img.svg" alt="" />}
      </button>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onChangeFile} />
    </div>

    <div className="h-[311px] rounded-[20px] bg-[#FEF7CD] overflow-hidden border border-amber-200">
      <div className="py-3 text-center font-extrabold text-lg text-amber-800">Memo</div>
      <textarea
        placeholder="메모를 입력하세요"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="text-center font-normal text-slate-800 w-full h-full resize-y outline-none p-6 bg-[length:100%_32px] bg-repeat-y bg-[linear-gradient(transparent_31px,_#F8E9A0_31px,_#F8E9A0_32px,_transparent_32px)]"
      />
    </div>
  </div>

<div className="flex items-center justify-center md:justify-end gap-4">
  <button
  type="button"
  onClick={handleSave}
  disabled={updateItem.isPending}
  className={`inline-flex items-center gap-1 px-6 h-13 rounded-3xl border-2 border-slate-900 shadow-[2px_2px_0_#0F172A] 
    ${isDirty ? "bg-lime-300 text-slate-900" : "bg-slate-200 text-slate-900"}`}
>
  <img src="/edit-check.svg" alt="" />
  {updateItem.isPending ? "저장 중…" : "수정 완료"}
</button>
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleteItem.isPending}
      className="inline-flex items-center gap-1 px-6 h-13 rounded-3xl border-2 border-slate-900 bg-rose-500 text-white shadow-[2px_2px_0_#0F172A]"
    >
      <img src="/delete.svg" alt="" />
      {deleteItem.isPending ? "삭제 중…" : "삭제하기"}
    </button>
  </div>
</div>

  );
}
