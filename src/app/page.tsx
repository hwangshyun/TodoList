import Link from "next/link";

export default function Home() {
  return (
    <div >

      <section className="flex gap-2 ">
        <input className="w-full min-w-70 max-w-[1000px] bg-slate-200 text-slate-900 rounded-3xl border-[2px] border-slate-900 shadow-[2px_2px_0px_#0F172A]" type="text" placeholder="할 일을 입력해주세요" /><button
          className=" h-14 min-w-14  bg-slate-200 text-slate-900 rounded-3xl font-semibold border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A]"
        >
          +
        </button>

      </section>

      <div className="">해야할일<img src="/todo.svg" alt="" /></div>

      <div>
        완료
        <img src="/done.svg" alt="" />

      </div>
    </div>
  );
}
