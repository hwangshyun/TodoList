import Link from "next/link";

export default function TodoCard({ id, name, isCompleted, onToggle }: {
    id: number, name: string, isCompleted: boolean, onToggle?: (id: number, next: boolean) => void;
}) {
    return (
        <div
            className={`w-full h-[50px] flex items-center p-2 gap-2.5 rounded-[27px] border-slate-900 border-[2px] 
          ${isCompleted ? "bg-violet-100" : "bg-white"}`}
        >
            <button
                type="button"
                onClick={() => onToggle?.(id, !isCompleted)}
                className="cursor-pointer"
            >
                <img src={isCompleted ? "/check.svg" : "/empty-check.svg"} alt="check" />
            </button>
            <Link href={`/items/${id}`}>
                <p className={isCompleted ? "line-through text-slate-500" : "text-slate-900"}>
                    {name}
                </p></Link>
        </div>
    );
}