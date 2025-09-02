"use client";

import Link from "next/link";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <html lang="ko">
      <body className="flex flex-col w-full">
        <header className="px-4 w-full mx-auto h-15 flex items-center border border-b-[1px] border-slate-100">
          <Link href="/">
            <img src="/main.svg" alt="logo-pc" className="hidden md:block" />
            <img src="/main-mobile.svg" alt="logo-mobile" className="block md:hidden" />
          </Link>
        </header>
        <main className="p-4 w-full max-w-[1200px] mx-auto ">
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </main>
      </body>
    </html>
  );
}
