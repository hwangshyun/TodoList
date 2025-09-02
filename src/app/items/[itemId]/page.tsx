"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TENANT_ID } from "@/app/features/model/types";
import { getTodo, patchTodo, deleteTodo, useUploadImage } from "@/app/features/services/queries";

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const id = Number(itemId);
  const router = useRouter();

  const { data, isLoading, error } = getTodo(TENANT_ID, id);
  const updateItem = patchTodo(TENANT_ID);
  const deleteItem = deleteTodo(TENANT_ID);
  const upload = useUploadImage(TENANT_ID);           // ✅ 업로드 훅

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

  if (!itemId || Number.isNaN(id)) return <p>유효하지 않은 항목입니다.</p>;
  if (isLoading) return <p>로딩중…</p>;
  if (error) return <p className="text-rose-500">에러: {(error as Error).message}</p>;
  if (!data) return <p>데이터 없음</p>;

  // ✅ 파일 선택 → 업로드 → URL 상태 반영
  const onPickImage = () => fileInputRef.current?.click();

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    upload.mutate(f, {
      onSuccess: (url) => {
        setImageUrl(url); // 서버에서 받은 url 저장
      },
      onError: (err) => {
        alert((err as Error).message);
        e.target.value = "";
      },
    });
  };

  const handleSave = () => {
    updateItem.mutate(
      { id, dto: { name: name.trim(), memo: memo || null, imageUrl, isCompleted } },
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
    if (!confirm("정말 삭제하시겠어요?")) return;
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
      {/* 제목 + 완료 토글 */}
      <div className={`w-full h-[56px] flex items-center gap-3 rounded-full border-2 border-slate-900 shadow-[2px_2px_0_#0F172A] px-4 ${isCompleted ? "bg-violet-100" : "bg-white"}`}>
        <button
          type="button"
          onClick={() => setIsCompleted((v) => !v)}
          aria-label={isCompleted ? "완료 해제" : "완료 처리"}
          className="grid place-items-center h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-100 cursor-pointer"
        >
          <img src={isCompleted ? "/check.svg" : "/empty-check.svg"} alt="" />
        </button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`flex-1 text-center font-semibold outline-none bg-transparent ${isCompleted ? "line-through text-slate-500" : "text-slate-900"}`}
          placeholder="제목을 입력하세요"
        />
        <div className="w-8" />
      </div>

      {/* 이미지 영역 */}
      <div className="relative rounded-[20px] border-2 border-dashed border-slate-300 bg-slate-50/60 min-h-[220px] grid place-items-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="이미지" className="max-h-[360px] object-contain" />
        ) : (
          <div className="text-slate-400 flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-slate-200 grid place-items-center border-2 border-slate-300">
              <span className="text-xl">🖼️</span>
            </div>
            <p className="text-sm">{upload.isPending ? "업로드 중…" : "이미지를 업로드하세요"}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onPickImage}
          disabled={upload.isPending}
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full border-2 border-slate-900 shadow-[2px_2px_0_#0F172A] bg-slate-200 text-slate-900 grid place-items-center text-xl cursor-pointer disabled:opacity-60"
          title="이미지 추가"
        >
          +
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChangeFile}
        />
      </div>

      {/* 메모 */}
      <div className="rounded-[20px] border-2 border-slate-900 bg-[#FEF7CD] shadow-[2px_2px_0_#0F172A] overflow-hidden">
        <div className="py-3 text-center font-semibold text-amber-800 border-b border-amber-200">Memo</div>
        <div className="p-6">
          <textarea
            placeholder="메모를 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full min-h-[140px] resize-y outline-none bg-[length:100%_32px] bg-repeat-y bg-[linear-gradient(transparent_31px,_#F8E9A0_31px,_#F8E9A0_32px,_transparent_32px)] bg-transparent"
          />
        </div>
      </div>

      {/* 액션 */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateItem.isPending}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-3xl border-2 border-slate-900 bg-slate-200 text-slate-900 shadow-[2px_2px_0_#0F172A] font-semibold"
        >
          {updateItem.isPending ? "저장 중…" : "수정 완료"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteItem.isPending}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-3xl border-2 border-slate-900 bg-rose-500 text-white shadow-[2px_2px_0_#0F172A] font-semibold"
        >
          {deleteItem.isPending ? "삭제 중…" : "삭제하기"}
        </button>
      </div>
    </div>
  );
}
