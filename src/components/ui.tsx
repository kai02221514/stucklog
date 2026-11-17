import Link from "next/link";
import type { Post } from "@/data/models";

export function TechnologyTag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full border border-[#cfe0ff] bg-[#f5f9ff] px-2.5 py-1 text-xs font-medium text-[#1d4ed8]">{children}</span>;
}

export function StatusTag({ status }: { status: Post["status"] }) {
  return status === "resolved" ? (
    <span className="inline-flex rounded-full border border-[#a7f3d0] bg-[#ecfdf5] px-2.5 py-1 text-xs font-medium text-[#047857]">解決済み</span>
  ) : (
    <span className="inline-flex rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2.5 py-1 text-xs font-medium text-[#c2410c]">未解決</span>
  );
}

export function ProjectTag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full border border-[#cbd5e1] bg-[#f1f5f9] px-2.5 py-1 text-xs font-medium text-[#475569]">{children}</span>;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.id}`} className="flex min-h-[150px] flex-col gap-[9px] rounded-lg border border-[#e2e8f0] bg-white px-[22px] py-[18px] transition hover:border-[#bfdbfe] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">
      <div className="flex flex-wrap gap-2"><StatusTag status={post.status} />{post.technologies.map((technology) => <TechnologyTag key={technology}>{technology}</TechnologyTag>)}</div>
      <h2 className="text-[17px] font-bold text-[#0f172a]">{post.title}</h2>
      <p className="line-clamp-1 text-sm leading-6 text-[#475569]">{post.summary}</p>
      <p className="mt-auto text-xs text-[#64748b]">{post.createdLabel}</p>
    </Link>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="rounded-lg border border-[#e2e8f0] bg-white px-8 py-14 text-center"><h2 className="text-base font-bold text-[#0f172a]">{title}</h2><p className="mt-2 text-sm text-[#64748b]">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}
