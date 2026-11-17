"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { SiteHeader } from "@/components/site-header";
import { TechnologyInput } from "@/components/technology-input";
import { EmptyState, PostCard, TechnologyTag } from "@/components/ui";
import { useAppStore } from "@/lib/app-store";
import type { PostStatus } from "@/data/models";

type StatusFilter = "all" | PostStatus;

function ProjectPageContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, posts, updateProjectTechnologies } = useAppStore();
  const project = projects.find((item) => item.id === projectId);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editingTechnology, setEditingTechnology] = useState(false);
  const [technologies, setTechnologies] = useState(project?.technologies ?? []);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    return posts.filter((post) => {
      if (post.projectId !== projectId) return false;
      if (status !== "all" && post.status !== status) return false;
      if (!normalized) return true;
      return [post.title, post.content, ...post.technologies].join(" ").toLocaleLowerCase("ja").includes(normalized);
    });
  }, [posts, projectId, query, status]);

  if (!project) return <div className="min-h-screen bg-[#f8fafc]"><SiteHeader /><main className="mx-auto max-w-[1120px] py-16"><EmptyState title="プロジェクトが見つかりません" description="プロジェクト一覧から選び直してください。" action={<Link href="/" className="text-sm font-medium text-[#1d4ed8]">一覧へ戻る</Link>} /></main></div>;

  const filterClass = (selected: boolean, kind: StatusFilter) => {
    if (selected) return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
    if (kind === "open") return "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]";
    if (kind === "resolved") return "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]";
    return "border-[#cbd5e1] bg-white text-[#475569]";
  };

  return <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]"><SiteHeader /><main className="mx-auto w-full max-w-[1120px] pb-16 pt-8">
    <div className="mt-5 flex items-center gap-4"><div><h1 className="text-[28px] font-bold">{project.name}</h1><p className="mt-1.5 text-sm text-[#64748b]">{project.description}</p></div><Link href={`/projects/${project.id}/posts/new`} className="ml-auto flex h-[42px] w-[168px] items-center justify-center rounded-md bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8]">新しく投稿</Link></div>
    <div className="mt-5 flex h-[52px] items-center gap-3 rounded-md border border-[#e2e8f0] bg-white px-4"><span className="text-[13px] font-medium text-[#64748b]">使用技術</span>{project.technologies.map((technology) => <TechnologyTag key={technology}>{technology}</TechnologyTag>)}<button type="button" onClick={() => { setTechnologies(project.technologies); setEditingTechnology(true); }} className="ml-auto text-sm font-medium text-[#1d4ed8]">編集</button></div>
    <div className="mt-5 flex items-start gap-3"><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="タイトル・内容・技術タグを検索" className="h-11 w-[700px] rounded-md border border-[#cbd5e1] bg-white px-4 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /><div className="flex gap-2">{([['all','すべて'],['open','未解決'],['resolved','解決済み']] as const).map(([value,label]) => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${filterClass(status === value, value)}`}>{label}</button>)}</div></div>
    {filteredPosts.length > 0 ? <div className="mt-5 flex flex-col gap-3">{filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <div className="mt-5"><EmptyState title="該当する投稿がありません" description="検索語または絞り込み条件を変更してください。" action={<button type="button" onClick={() => { setQuery(""); setStatus("all"); }} className="text-sm font-medium text-[#1d4ed8]">検索条件をクリア</button>} /></div>}
  </main>{editingTechnology ? <Modal title="使用技術を編集" description="プロジェクトで利用する技術を追加・削除できます。" onClose={() => setEditingTechnology(false)}><TechnologyInput value={technologies} onChange={setTechnologies} />{saveError ? <p role="alert" className="mt-3 text-sm text-[#b91c1c]">{saveError}</p> : null}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setEditingTechnology(false)} className="h-[42px] rounded-md border border-[#cbd5e1] px-4 text-sm font-medium disabled:opacity-50">キャンセル</button><button type="button" disabled={saving} onClick={async () => { if (technologies.length === 0) return; setSaving(true); setSaveError(""); try { await updateProjectTechnologies(project.id, technologies); setEditingTechnology(false); } catch (error) { setSaveError(error instanceof Error ? error.message : "使用技術を保存できませんでした。"); } finally { setSaving(false); } }} className="h-[42px] rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white disabled:opacity-50">{saving ? "保存中..." : "保存する"}</button></div></Modal> : null}</div>;
}

export default function ProjectPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}><ProjectPageContent /></Suspense>;
}
