"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Modal } from "@/components/modal";
import { SiteHeader } from "@/components/site-header";
import { TechnologyInput } from "@/components/technology-input";
import { StatusTag, TechnologyTag } from "@/components/ui";
import { useAppStore } from "@/lib/app-store";
import { formatRelativeUpdateTime } from "@/lib/format-relative-time";

function PostDetailPageContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { posts, projects, updatePost, resolvePost } = useAppStore();
  const post = posts.find((item) => item.id === id);
  const project = projects.find((item) => item.id === post?.projectId);
  const fromKnowledge = searchParams.get("from") === "knowledge";
  const [editing, setEditing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [technologies, setTechnologies] = useState<string[]>(post?.technologies ?? []);
  const [resolution, setResolution] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!post || !project) return <div className="min-h-screen bg-[#f8fafc]"><SiteHeader /><main className="mx-auto max-w-[900px] py-16"><div className="rounded-lg border border-[#e2e8f0] bg-white px-9 py-20 text-center"><h1 className="text-lg font-bold">投稿が見つかりません</h1><Link href={fromKnowledge ? "/knowledge" : "/"} className="mt-4 inline-block text-sm font-medium text-[#1d4ed8]">{fromKnowledge ? "解決済みナレッジに戻る" : "プロジェクト一覧へ戻る"}</Link></div></main></div>;

  const openEdit = () => { setTitle(post.title); setContent(post.content); setTechnologies(post.technologies); setError(""); setEditing(true); };
  const submitEdit = async (event: FormEvent) => { event.preventDefault(); if (!title.trim() || !content.trim() || technologies.length === 0) { setError("すべての必須項目を入力してください。"); return; } setSaving(true); setError(""); try { await updatePost(post.id, { title: title.trim(), content: content.trim(), technologies }); setEditing(false); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "投稿を保存できませんでした。"); } finally { setSaving(false); } };
  const submitResolution = async (event: FormEvent) => { event.preventDefault(); if (!resolution.trim()) { setError("解決メモを入力してください。"); return; } setSaving(true); setError(""); try { await resolvePost(post.id, resolution.trim()); setResolving(false); setResolution(""); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "解決メモを保存できませんでした。"); } finally { setSaving(false); } };

  const backHref = fromKnowledge ? "/knowledge" : `/projects/${project.id}`;
  const backLabel = fromKnowledge ? "解決済みナレッジに戻る" : `${project.name}の投稿一覧に戻る`;

  return <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]"><SiteHeader /><main className="mx-auto w-full max-w-[900px] pb-16 pt-8"><Link href={backHref} className="text-[13px] font-medium text-[#1d4ed8]">← {backLabel}</Link>
    <article className="mt-5 min-h-[690px] rounded-lg border border-[#e2e8f0] bg-white px-[34px] pb-[34px] pt-[30px]">
      <div className="flex items-start gap-2"><StatusTag status={post.status} />{post.technologies.map((technology) => <TechnologyTag key={technology}>{technology}</TechnologyTag>)}<div className="ml-auto flex gap-3"><button type="button" onClick={openEdit} className="h-[42px] w-[72px] rounded-lg border border-[#bfdbfe] bg-white text-sm font-medium text-[#1d4ed8]">編集</button>{post.status === "open" ? <button type="button" onClick={() => { setError(""); setResolving(true); }} className="h-[42px] w-40 rounded-md bg-[#2563eb] text-sm font-medium text-white">解決済みにする</button> : null}</div></div>
      <h1 className="mt-5 text-[26px] font-bold">{post.title}</h1><p className="mt-5 text-xs text-[#64748b]">最終更新: {formatRelativeUpdateTime(post.updatedAt)}</p><div className="mt-5 border-t border-[#e2e8f0] pt-5"><h2 className="text-[15px] font-bold text-[#334155]">内容</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#334155]">{post.content}</p></div>
      {post.status === "resolved" && post.resolution ? <div className="mt-6 rounded-md border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3.5"><h2 className="text-[13px] font-bold text-[#047857]">解決メモ</h2><p className="mt-1.5 text-sm text-[#334155]">{post.resolution}</p></div> : <div className="mt-6 rounded-md border border-[#cfe0ff] bg-[#f5f9ff] px-4 py-3.5"><h2 className="text-[13px] font-bold text-[#1d4ed8]">解決したら</h2><p className="mt-1.5 text-[13px] text-[#475569]">「解決済みにする」から解決メモを残すと、横断ナレッジに表示されます。</p></div>}
    </article></main>
    {editing ? <Modal title="投稿を編集" description="内容と技術タグを修正できます。" onClose={() => setEditing(false)} width="max-w-[680px]"><form onSubmit={submitEdit} className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-medium">タイトル　必須</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-md border border-[#cbd5e1] px-4 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /></label><div><p className="mb-2 text-sm font-medium">技術タグ　必須</p><TechnologyInput value={technologies} onChange={setTechnologies} /></div><label className="block"><span className="mb-2 block text-sm font-medium">内容　必須</span><textarea value={content} onChange={(event) => setContent(event.target.value)} className="h-36 w-full resize-none rounded-md border border-[#cbd5e1] px-4 py-3 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /></label>{error ? <p className="text-sm text-[#b91c1c]">{error}</p> : null}<div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setEditing(false)} className="h-[42px] rounded-md border border-[#cbd5e1] px-4 text-sm font-medium disabled:opacity-50">キャンセル</button><button type="submit" disabled={saving} className="h-[42px] rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white disabled:opacity-50">{saving ? "保存中..." : "保存する"}</button></div></form></Modal> : null}
    {resolving ? <Modal title="解決済みにする" description="あとから再利用できるよう、解決方法を短く残してください。" onClose={() => setResolving(false)}><form onSubmit={submitResolution}><label className="block"><span className="mb-2 block text-sm font-medium">解決メモ　必須</span><textarea value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="例：RDSのセキュリティグループで接続元をEC2に限定" className="h-[118px] w-full resize-none rounded-md border border-[#cbd5e1] px-4 py-3 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" autoFocus /></label>{error ? <p className="mt-3 text-sm text-[#b91c1c]">{error}</p> : null}<div className="mt-5 flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setResolving(false)} className="h-[42px] rounded-md border border-[#cbd5e1] px-4 text-sm font-medium disabled:opacity-50">キャンセル</button><button type="submit" disabled={saving} className="h-[42px] w-40 rounded-md bg-[#2563eb] text-sm font-medium text-white disabled:opacity-50">{saving ? "保存中..." : "解決済みにする"}</button></div></form></Modal> : null}
  </div>;
}

export default function PostDetailPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}><PostDetailPageContent /></Suspense>;
}
