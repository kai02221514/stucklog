import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DemoPostsProvider } from "@/lib/demo-post-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "StuckLog",
  description: "技術でつまずいた内容を記録・検索できる最小構成のデモ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <DemoPostsProvider>{children}</DemoPostsProvider>
      </body>
    </html>
  );
}
