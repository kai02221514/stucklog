"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { EmptyState, ProjectTag, TechnologyTag } from "@/components/ui";
import { useAppStore } from "@/lib/app-store";

export default function KnowledgePage() {
  const { posts, projects } = useAppStore();
  const [query, setQuery] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [technology, setTechnology] = useState("all");
  const technologies = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.technologies))).sort(), [posts]);
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    return posts.filter((post) => {
      if (post.status !== "resolved") return false;
      if (projectId !== "all" && post.projectId !== projectId) return false;
      if (technology !== "all" && !post.technologies.includes(technology)) return false;
      if (!normalized) return true;
      return [post.title, post.resolution ?? "", ...post.technologies].join(" ").toLocaleLowerCase("ja").includes(normalized);
    });
  }, [posts, projectId, query, technology]);

  return <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]"><SiteHeader active="knowledge" /><main className="mx-auto w-full max-w-[1120px] pb-16 pt-10"><h1 className="text-[28px] font-bold">解決済みナレッジ</h1><p className="mt-1.5 text-sm text-[#64748b]">過去のすべてのプロジェクトから、解決策を検索できます。</p>
    <div className="mt-5 flex gap-3"><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="タイトル・解決メモ・技術タグを検索" className="h-11 w-[680px] rounded-md border border-[#cbd5e1] bg-white px-4 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /><label className="sr-only" htmlFor="project-filter">プロジェクト</label><select id="project-filter" value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-11 w-[210px] rounded-md border border-[#cbd5e1] bg-white px-3 text-sm text-[#475569]"><option value="all">プロジェクト：すべて</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><label className="sr-only" htmlFor="technology-filter">技術</label><select id="technology-filter" value={technology} onChange={(event) => setTechnology(event.target.value)} className="h-11 w-[206px] rounded-md border border-[#cbd5e1] bg-white px-3 text-sm text-[#475569]"><option value="all">技術：すべて</option>{technologies.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    <div className="mt-5 flex gap-2"><p className="text-[13px] font-medium text-[#475569]">解決済み {results.length}件</p><span className="text-xs text-[#64748b]">新しい順</span></div>
    {results.length > 0 ? <div className="mt-5 flex flex-col gap-3">{results.map((post) => { const project = projects.find((item) => item.id === post.projectId); return <Link key={post.id} href={`/posts/${post.id}`} className="flex min-h-[168px] flex-col gap-[9px] rounded-lg border border-[#e2e8f0] bg-white px-[22px] py-[18px] transition hover:border-[#bfdbfe] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"><div className="flex flex-wrap gap-2">{project ? <ProjectTag>{project.name}</ProjectTag> : null}{post.technologies.map((item) => <TechnologyTag key={item}>{item}</TechnologyTag>)}</div><h2 className="text-[17px] font-bold">{post.title}</h2><p className="line-clamp-1 text-sm leading-6 text-[#475569]">解決メモ： {post.resolution}</p><p className="mt-auto text-xs text-[#64748b]">{post.author}　・　{post.createdLabel}</p></Link>; })}</div> : <div className="mt-5"><EmptyState title="該当する投稿がありません" description="検索語または絞り込み条件を変更してください。" action={<button type="button" onClick={() => { setQuery(""); setProjectId("all"); setTechnology("all"); }} className="text-sm font-medium text-[#1d4ed8]">検索条件をクリア</button>} /></div>}
  </main></div>;
}
