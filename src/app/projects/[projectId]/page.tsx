"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { FilterSelect, type SelectOption } from "@/components/filter-select";
import { Modal } from "@/components/modal";
import { SiteHeader } from "@/components/site-header";
import { TechnologyInput } from "@/components/technology-input";
import { EmptyState, PostCard, TechnologyTag } from "@/components/ui";
import { useAppStore } from "@/lib/app-store";
import type { PostStatus } from "@/data/models";

type StatusFilter = "all" | PostStatus;

const statusOptions: SelectOption<StatusFilter>[] = [
  { value: "all", label: "すべて" },
  { value: "open", label: "未解決" },
  { value: "resolved", label: "解決済み" },
];

function ProjectPageContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, posts, updateProjectTechnologies } = useAppStore();
  const project = projects.find((item) => item.id === projectId);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [technology, setTechnology] = useState("all");
  const [editingTechnology, setEditingTechnology] = useState(false);
  const [technologies, setTechnologies] = useState(project?.technologies ?? []);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const projectTechnologies = useMemo(
    () => Array.from(new Set(posts.filter((post) => post.projectId === projectId).flatMap((post) => post.technologies))).sort(),
    [posts, projectId],
  );
  const technologyOptions = useMemo<SelectOption[]>(() => [
    { value: "all", label: "すべて" },
    ...projectTechnologies.map((item) => ({ value: item, label: item })),
  ], [projectTechnologies]);

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ja");
    return posts.filter((post) => {
      if (post.projectId !== projectId) return false;
      if (status !== "all" && post.status !== status) return false;
      if (technology !== "all" && !post.technologies.includes(technology)) return false;
      if (!normalized) return true;
      return [post.title, post.content, ...post.technologies].join(" ").toLocaleLowerCase("ja").includes(normalized);
    });
  }, [posts, projectId, query, status, technology]);

  if (!project) return <div className="min-h-screen bg-[#f8fafc]"><SiteHeader /><main className="mx-auto max-w-[1120px] py-16"><EmptyState title="プロジェクトが見つかりません" description="プロジェクト一覧から選び直してください。" action={<Link href="/" className="text-sm font-medium text-[#1d4ed8]">一覧へ戻る</Link>} /></main></div>;

  return <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]"><SiteHeader /><main className="mx-auto w-full max-w-[1120px] pb-16 pt-8">
    <div className="mt-5 flex items-center gap-4"><div><h1 className="text-[28px] font-bold">{project.name}</h1><p className="mt-1.5 text-sm text-[#64748b]">{project.description}</p></div><Link href={`/projects/${project.id}/posts/new`} className="ml-auto flex h-[42px] w-[168px] items-center justify-center rounded-md bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8]">新しく投稿</Link></div>
    <div className="mt-5 flex h-[52px] items-center gap-3 rounded-md border border-[#e2e8f0] bg-white px-4"><span className="text-[13px] font-medium text-[#64748b]">使用技術</span>{project.technologies.map((technology) => <TechnologyTag key={technology}>{technology}</TechnologyTag>)}<button type="button" onClick={() => { setTechnologies(project.technologies); setEditingTechnology(true); }} className="ml-auto text-sm font-medium text-[#1d4ed8]">編集</button></div>
    <div className="mt-5 flex gap-3"><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="タイトル・内容・技術タグを検索" className="h-11 min-w-0 flex-1 rounded-md border border-[#cbd5e1] bg-white px-4 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /><div className="flex w-[206px]"><FilterSelect label="ステータス" options={statusOptions} value={status} onChange={setStatus} /></div><div className="flex w-[206px]"><FilterSelect label="技術" options={technologyOptions} value={technology} onChange={setTechnology} /></div></div>
    {filteredPosts.length > 0 ? <div className="mt-5 flex flex-col gap-3">{filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <div className="mt-5"><EmptyState title="該当する投稿がありません" description="検索語または絞り込み条件を変更してください。" action={<button type="button" onClick={() => { setQuery(""); setStatus("all"); setTechnology("all"); }} className="text-sm font-medium text-[#1d4ed8]">検索条件をクリア</button>} /></div>}
  </main>{editingTechnology ? <Modal title="使用技術を編集" description="プロジェクトで利用する技術を追加・削除できます。" onClose={() => setEditingTechnology(false)}><TechnologyInput value={technologies} onChange={setTechnologies} />{saveError ? <p role="alert" className="mt-3 text-sm text-[#b91c1c]">{saveError}</p> : null}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setEditingTechnology(false)} className="h-[42px] rounded-md border border-[#cbd5e1] px-4 text-sm font-medium disabled:opacity-50">キャンセル</button><button type="button" disabled={saving} onClick={async () => { if (technologies.length === 0) return; setSaving(true); setSaveError(""); try { await updateProjectTechnologies(project.id, technologies); setEditingTechnology(false); } catch (error) { setSaveError(error instanceof Error ? error.message : "使用技術を保存できませんでした。"); } finally { setSaving(false); } }} className="h-[42px] rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white disabled:opacity-50">{saving ? "保存中..." : "保存する"}</button></div></Modal> : null}</div>;
}

export default function ProjectPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}><ProjectPageContent /></Suspense>;
}
