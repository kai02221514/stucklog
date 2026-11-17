"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { EmptyState, ProjectTag, TechnologyTag } from "@/components/ui";
import { useAppStore } from "@/lib/app-store";

const PAGE_SIZE = 5;

type SelectOption = { label: string; value: string };

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none">
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterSelect({ ariaLabel, options, value, onChange }: { ariaLabel: string; options: SelectOption[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-md border border-[#cbd5e1] bg-white px-4 text-left text-sm text-[#475569] outline-none transition hover:border-[#94a3b8] focus-visible:border-[#2563eb] focus-visible:ring-2 focus-visible:ring-[#dbeafe]"
      >
        <span className="min-w-0 truncate">{selected.label}</span><ChevronIcon open={open} />
      </button>
      {open ? (
        <div role="listbox" aria-label={ariaLabel} className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-full overflow-hidden rounded-lg border border-[#e2e8f0] bg-white p-1.5 shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
          {options.map((option) => {
            const isSelected = option.value === value;
            return <button key={option.value} type="button" role="option" aria-selected={isSelected} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition ${isSelected ? "bg-[#eff6ff] font-medium text-[#1d4ed8]" : "text-[#334155] hover:bg-[#f8fafc]"}`}>{option.label}</button>;
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function KnowledgePage() {
  const { posts, projects } = useAppStore();
  const [query, setQuery] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [technology, setTechnology] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const technologies = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.technologies))).sort(), [posts]);
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    const filtered = posts.filter((post) => {
      if (post.status !== "resolved") return false;
      if (projectId !== "all" && post.projectId !== projectId) return false;
      if (technology !== "all" && !post.technologies.includes(technology)) return false;
      if (!normalized) return true;
      return [post.title, post.resolution ?? "", ...post.technologies].join(" ").toLocaleLowerCase("ja").includes(normalized);
    });
    return sortOrder === "newest" ? filtered : [...filtered].reverse();
  }, [posts, projectId, query, sortOrder, technology]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const displayedPage = Math.min(currentPage, totalPages);
  const visibleResults = results.slice((displayedPage - 1) * PAGE_SIZE, displayedPage * PAGE_SIZE);

  const projectOptions = useMemo<SelectOption[]>(() => [
    { value: "all", label: "プロジェクト：すべて" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ], [projects]);
  const technologyOptions = useMemo<SelectOption[]>(() => [
    { value: "all", label: "技術：すべて" },
    ...technologies.map((item) => ({ value: item, label: item })),
  ], [technologies]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <SiteHeader active="knowledge" />
      <main className="mx-auto w-full max-w-[1120px] pb-16 pt-10">
        <h1 className="text-[28px] font-bold">解決済みナレッジ</h1>
        <div className="mt-5 flex gap-3">
          <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }} placeholder="タイトル・解決メモ・技術タグを検索" className="h-11 w-[680px] rounded-md border border-[#cbd5e1] bg-white px-4 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" />
          <div className="flex w-[210px]"><FilterSelect ariaLabel="プロジェクトで絞り込む" options={projectOptions} value={projectId} onChange={(value) => { setProjectId(value); setCurrentPage(1); }} /></div>
          <div className="flex w-[206px]"><FilterSelect ariaLabel="技術で絞り込む" options={technologyOptions} value={technology} onChange={(value) => { setTechnology(value); setCurrentPage(1); }} /></div>
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
                return <Link key={post.id} href={`/posts/${post.id}`} className="flex min-h-[168px] flex-col gap-[9px] rounded-lg border border-[#e2e8f0] bg-white px-[22px] py-[18px] transition hover:border-[#bfdbfe] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">
                  <div className="flex flex-wrap gap-2">{project ? <ProjectTag>{project.name}</ProjectTag> : null}{post.technologies.map((item) => <TechnologyTag key={item}>{item}</TechnologyTag>)}</div>
                  <h2 className="text-[17px] font-bold">{post.title}</h2>
                  <p className="line-clamp-1 text-sm leading-6 text-[#475569]">解決メモ： {post.resolution}</p>
                  <p className="mt-auto text-xs text-[#64748b]">{post.author}　・　{post.createdLabel}</p>
                </Link>;
              })}
            </div>
            {totalPages > 1 ? (
              <nav aria-label="ナレッジ一覧のページ" className="mt-6 flex items-center justify-center gap-2">
                <button type="button" onClick={() => setCurrentPage(Math.max(1, displayedPage - 1))} disabled={displayedPage === 1} className="h-9 rounded-md border border-[#cbd5e1] bg-white px-3 text-sm font-medium text-[#475569] transition hover:border-[#94a3b8] disabled:cursor-not-allowed disabled:opacity-40">前へ</button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button key={page} type="button" aria-current={displayedPage === page ? "page" : undefined} onClick={() => setCurrentPage(page)} className={`size-9 rounded-md border text-sm font-medium transition ${displayedPage === page ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-[#cbd5e1] bg-white text-[#475569] hover:border-[#94a3b8]"}`}>{page}</button>)}
                <button type="button" onClick={() => setCurrentPage(Math.min(totalPages, displayedPage + 1))} disabled={displayedPage === totalPages} className="h-9 rounded-md border border-[#cbd5e1] bg-white px-3 text-sm font-medium text-[#475569] transition hover:border-[#94a3b8] disabled:cursor-not-allowed disabled:opacity-40">次へ</button>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="mt-5"><EmptyState title="該当する投稿がありません" description="検索語または絞り込み条件を変更してください。" action={<button type="button" onClick={() => { setQuery(""); setProjectId("all"); setTechnology("all"); }} className="text-sm font-medium text-[#1d4ed8]">検索条件をクリア</button>} /></div>
        )}
      </main>
    </div>
  );
}
