import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DemoStoreProvider } from "@/lib/demo-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "StuckLog",
  description: "プロジェクトごとにつまずきと解決策を共有するデモ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <DemoStoreProvider>{children}</DemoStoreProvider>
      </body>
    </html>
  );
}
