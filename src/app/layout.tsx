import Link from "next/link";
import "./globals.css";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex flex-col w-full">
        <header className="w-full h-15 flex items-center border border-b-[1px] border-slate-100">
          <Link href="/">

            <img src="/main.svg" alt="logo-pc" className="hidden md:block" />

            <img src="/main-mobile.svg" alt="logo-mobile" className="block md:hidden " />
          </Link></header>
        <main className="p-4 w-full max-w-[1000px] mx-auto">{children}</main>
      </body>
      </html>
    );
}
