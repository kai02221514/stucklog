import type { ReactNode } from "react";

export function PostTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#cfe0ff] bg-[#f5f9ff] px-2.5 py-1 text-xs font-medium text-[#1d4ed8]">
      {children}
    </span>
  );
}
