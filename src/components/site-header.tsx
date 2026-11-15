import Link from "next/link";

type SiteHeaderProps = { active?: "projects" | "knowledge" };

export function SiteHeader({ active = "projects" }: SiteHeaderProps) {
  const navClass = (selected: boolean) =>
    `rounded-md px-3 py-2 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] ${selected ? "bg-[#eaf2ff] font-medium text-[#1d4ed8]" : "text-[#475569] hover:bg-[#f8fafc]"}`;

  return (
    <header className="h-[72px] border-b border-[#e2e8f0] bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1120px] items-center gap-3">
        <Link href="/" className="text-xl font-bold text-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">StuckLog</Link>
        <div className="w-3" />
        <nav aria-label="メインナビゲーション" className="flex items-center gap-1">
          <Link href="/" className={navClass(active === "projects")}>プロジェクト</Link>
          <Link href="/knowledge" className={navClass(active === "knowledge")}>解決済みナレッジ</Link>
        </nav>
        <span className="ml-auto text-[13px] font-medium text-[#475569]">北田 大海</span>
      </div>
    </header>
  );
}
