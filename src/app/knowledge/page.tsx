"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterSelect, type SelectOption } from "@/components/filter-select";
import { Pagination } from "@/components/pagination";
import { SiteHeader } from "@/components/site-header";
import { EmptyState, ProjectTag, StatusTag, TechnologyTag } from "@/components/ui";
import { KNOWLEDGE_STATUSES, POST_STATUS_LABELS, type PostStatus } from "@/data/models";
import { useAppStore } from "@/lib/app-store";
import { formatRelativeUpdateTime } from "@/lib/format-relative-time";

const PAGE_SIZE = 5;
type KnowledgeStatus = Exclude<PostStatus, "open">;
type StatusFilter = "all" | KnowledgeStatus;

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none">
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function KnowledgePage() {
  const { posts, projects } = useAppStore();
  const [query, setQuery] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [technology, setTechnology] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const technologies = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.technologies))).sort(), [posts]);
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    const filtered = posts.filter((post) => {
      if (post.status === "open") return false;
      if (projectId !== "all" && post.projectId !== projectId) return false;
      if (status !== "all" && post.status !== status) return false;
      if (technology !== "all" && !post.technologies.includes(technology)) return false;
      if (!normalized) return true;
      return [post.title, post.resolution ?? "", ...post.technologies].join(" ").toLocaleLowerCase("ja").includes(normalized);
    });
    return sortOrder === "newest" ? filtered : [...filtered].reverse();
  }, [posts, projectId, query, sortOrder, status, technology]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const displayedPage = Math.min(currentPage, totalPages);
  const visibleResults = results.slice((displayedPage - 1) * PAGE_SIZE, displayedPage * PAGE_SIZE);

  const projectOptions = useMemo<SelectOption[]>(() => [
    { value: "all", label: "すべて" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ], [projects]);
  const technologyOptions = useMemo<SelectOption[]>(() => [
    { value: "all", label: "すべて" },
    ...technologies.map((item) => ({ value: item, label: item })),
  ], [technologies]);
  const statusOptions: SelectOption<StatusFilter>[] = [
    { value: "all", label: "すべて" },
    ...KNOWLEDGE_STATUSES.map((value) => ({ value, label: POST_STATUS_LABELS[value] })),
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <SiteHeader active="knowledge" />
      <main className="mx-auto w-full max-w-[1120px] pb-16 pt-10">
        <div className="mt-5 flex gap-3">
          <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }} placeholder="タイトル・判断メモ・技術タグを検索" className="h-11 min-w-0 flex-1 rounded-md border border-[#cbd5e1] bg-white px-4 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" />
          <div className="flex w-[190px]"><FilterSelect label="プロジェクト" options={projectOptions} value={projectId} onChange={(value) => { setProjectId(value); setCurrentPage(1); }} /></div>
          <div className="flex w-[190px]"><FilterSelect label="ステータス" options={statusOptions} value={status} onChange={(value) => { setStatus(value); setCurrentPage(1); }} /></div>
          <div className="flex w-[180px]"><FilterSelect label="技術" options={technologyOptions} value={technology} onChange={(value) => { setTechnology(value); setCurrentPage(1); }} /></div>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <p className="text-[13px] font-medium leading-none text-[#475569]">{results.length}件</p>
          <button type="button" onClick={() => { setSortOrder((current) => current === "newest" ? "oldest" : "newest"); setCurrentPage(1); }} aria-label={`現在は${sortOrder === "newest" ? "新しい順" : "古い順"}です。並び順を変更`} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium leading-none text-[#475569] transition hover:bg-[#e2e8f0] hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">
            {sortOrder === "newest" ? "新しい順" : "古い順"}<ChevronIcon />
          </button>
        </div>
        {results.length > 0 ? (
          <>
            <div className="mt-5 flex flex-col gap-3">
              {visibleResults.map((post) => {
                const project = projects.find((item) => item.id === post.projectId);
                return <Link key={post.id} href={`/posts/${post.id}?from=knowledge`} className="flex min-h-[168px] flex-col gap-[9px] rounded-lg border border-[#e2e8f0] bg-white px-[22px] py-[18px] transition hover:border-[#bfdbfe] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">
                  <div className="flex flex-wrap gap-2"><StatusTag status={post.status} />{project ? <ProjectTag>{project.name}</ProjectTag> : null}{post.technologies.map((item) => <TechnologyTag key={item}>{item}</TechnologyTag>)}</div>
                  <h2 className="text-[17px] font-bold">{post.title}</h2>
                  <p className="line-clamp-1 text-sm leading-6 text-[#475569]">判断・対応メモ： {post.resolution}</p>
                  <p className="mt-auto text-xs text-[#64748b]">最終更新: {formatRelativeUpdateTime(post.updatedAt)}</p>
                </Link>;
              })}
            </div>
            <Pagination ariaLabel="ナレッジ一覧のページ" currentPage={displayedPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div className="mt-5"><EmptyState title="該当する投稿がありません" description="検索語または絞り込み条件を変更してください。" action={<button type="button" onClick={() => { setQuery(""); setProjectId("all"); setStatus("all"); setTechnology("all"); }} className="text-sm font-medium text-[#1d4ed8]">検索条件をクリア</button>} /></div>
        )}
      </main>
    </div>
  );
}
