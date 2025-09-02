"use client";

import { TENANT_ID } from "./features/model/types";
import TodoCard from "./features/components/todoCard";
import { useState } from "react";
import { useGetTodos, usePatchTodo, usePostTodo } from "./features/services/queries";

export default function Home() {

  const { data = [], isLoading, error } = useGetTodos(TENANT_ID, 1, 100);
  const addTodo = usePostTodo(TENANT_ID)
  const updateTodo = usePatchTodo(TENANT_ID);

  const [value, setValue] = useState("");

  const handleAdd = () => {
    const name = value.trim();
    if (!name) return;

    addTodo.mutate(
      { name }, // dto
      {
        onSuccess: () => {

          alert('완료되었습니다')
          setValue("");
        },
      }
    );
  };
  const handleToggle = (id: number, current: boolean) => {
    updateTodo.mutate(
      { id, dto: { isCompleted: !current } },
      {
        onSuccess: () => {
          console.log("업데이트 완료!");
        },
      }
    );
  };
  if (isLoading) return <p>로딩중...</p>;
  if (error) return <p>에러: {(error as Error).message}</p>;

  console.log("data", data);
  return (
    <div >

      <section className="flex gap-2">
        <input
          className="outline-none w-full min-w-70  bg-slate-200 text-slate-900 rounded-3xl border-[2px] border-slate-900 shadow-[2px_2px_0px_#0F172A] px-4"
          type="text"
          placeholder="할 일을 입력해주세요"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />

        <button
          className={`h-14 min-w-14 rounded-3xl border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A] transition-colors
    ${value.trim() ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-900"} flex items-center justify-center gap-2 px-4`}
          onClick={handleAdd}
        >
        +
          <p className="hidden sm:block whitespace-nowrap">추가하기</p>
        </button>
      </section>
      <section className="flex flex-col md:flex-row gap-6 w-full mt-4">

        <div className="flex flex-col gap-3 items-start w-full">

          <img src="/todo.svg" alt="todo" />
          {data.filter((i) => !i.isCompleted).length === 0 ? (
            <div className="text-center text-slate-400">
              <img src="/empty-done.svg" alt="empty-done" className="h-60" />
              할 일이 없어요. <br />
              TODO를 새롭게 추가해주세요!
            </div>) : (
            data
              .filter((i) => !i.isCompleted)
              .map((i) => (
                <TodoCard
                  key={i.id}
                  id={i.id}
                  name={i.name}
                  isCompleted={i.isCompleted}
                  onToggle={() => handleToggle(i.id, i.isCompleted)}
                />
              ))
          )} </div>

        <div className="flex flex-col gap-3 items-start w-full ">
          <img src="/done.svg" alt="done" />
          {data.filter((i) => i.isCompleted).length === 0 ? (
            <div className="text-center text-slate-400">
              <img src="/empty-done.svg" alt="empty-done" className="h-60" />
              아직 다 한 일이 없어요. <br />
              해야 할 일을 체크해보세요!
            </div>
          ) : (
            data
              .filter((i) => i.isCompleted)
              .map((i) => (
                <TodoCard
                  key={i.id}
                  id={i.id}
                  name={i.name}
                  isCompleted={i.isCompleted}
                  onToggle={() => handleToggle(i.id, i.isCompleted)}
                />
              ))
          )}
        </div>
      </section>
    </div >

  );
}
