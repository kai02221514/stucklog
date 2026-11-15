import Link from "next/link";

type SiteHeaderProps = {
  active: "list" | "new";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  const navClass = (isActive: boolean) =>
    `rounded-md px-3 py-2 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] ${
      isActive
        ? "bg-[#eaf2ff] font-medium text-[#1d4ed8]"
        : "text-[#475569] hover:bg-[#f8fafc]"
    }`;

  return (
    <header className="h-[72px] border-b border-[#e2e8f0] bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1120px] items-center gap-3">
        <Link
          href="/"
          className="mr-3 text-xl font-bold text-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
        >
          StuckLog
        </Link>
        <nav aria-label="メインナビゲーション" className="flex items-center gap-1">
          <Link href="/" className={navClass(active === "list")}>
            投稿一覧
          </Link>
          <Link href="/posts/new" className={navClass(active === "new")}>
            新しく投稿
          </Link>
        </nav>
        <span className="ml-auto text-xs font-medium text-[#64748b]">
          Minimal MVP
        </span>
      </div>
    </header>
  );
}
