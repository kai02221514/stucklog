import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppStoreProvider } from "@/lib/app-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "StuckLog",
  description: "プロジェクトごとにつまずきと解決策を共有するデモ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
