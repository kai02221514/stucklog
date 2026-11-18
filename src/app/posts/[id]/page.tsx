"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Modal } from "@/components/modal";
import { SiteHeader } from "@/components/site-header";
import { TechnologyInput } from "@/components/technology-input";
import { StatusTag, TechnologyTag } from "@/components/ui";
import { POST_STATUSES, POST_STATUS_LABELS, type PostStatus } from "@/data/models";
import { useAppStore } from "@/lib/app-store";
import { formatRelativeUpdateTime } from "@/lib/format-relative-time";

function PostDetailPageContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { posts, projects, updatePost, updatePostStatus } = useAppStore();
  const post = posts.find((item) => item.id === id);
  const project = projects.find((item) => item.id === post?.projectId);
  const fromKnowledge = searchParams.get("from") === "knowledge";
  const [editing, setEditing] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [technologies, setTechnologies] = useState<string[]>(post?.technologies ?? []);
  const [selectedStatus, setSelectedStatus] = useState<PostStatus>(post?.status ?? "open");
  const [resolution, setResolution] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!post || !project) return <div className="min-h-screen bg-[#f8fafc]"><SiteHeader /><main className="mx-auto max-w-[900px] py-16"><div className="rounded-lg border border-[#e2e8f0] bg-white px-9 py-20 text-center"><h1 className="text-lg font-bold">投稿が見つかりません</h1><Link href={fromKnowledge ? "/knowledge" : "/"} className="mt-4 inline-block text-sm font-medium text-[#1d4ed8]">{fromKnowledge ? "ナレッジに戻る" : "プロジェクト一覧へ戻る"}</Link></div></main></div>;

  const openEdit = () => { setTitle(post.title); setContent(post.content); setTechnologies(post.technologies); setError(""); setEditing(true); };
  const submitEdit = async (event: FormEvent) => { event.preventDefault(); if (!title.trim() || !content.trim() || technologies.length === 0) { setError("すべての必須項目を入力してください。"); return; } setSaving(true); setError(""); try { await updatePost(post.id, { title: title.trim(), content: content.trim(), technologies }); setEditing(false); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "投稿を保存できませんでした。"); } finally { setSaving(false); } };
  const openStatusChange = () => { setSelectedStatus(post.status); setResolution(post.resolution ?? ""); setError(""); setChangingStatus(true); };
  const submitStatus = async (event: FormEvent) => { event.preventDefault(); if (selectedStatus !== "open" && !resolution.trim()) { setError("判断・対応メモを入力してください。"); return; } setSaving(true); setError(""); try { await updatePostStatus(post.id, selectedStatus, selectedStatus === "open" ? "" : resolution.trim()); setChangingStatus(false); setResolution(""); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "ステータスを保存できませんでした。"); } finally { setSaving(false); } };

  const backHref = fromKnowledge ? "/knowledge" : `/projects/${project.id}`;
  const backLabel = fromKnowledge ? "ナレッジに戻る" : `${project.name}の投稿一覧に戻る`;

  return <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]"><SiteHeader /><main className="mx-auto w-full max-w-[900px] pb-16 pt-8"><Link href={backHref} className="text-[13px] font-medium text-[#1d4ed8]">← {backLabel}</Link>
    <article className="mt-5 min-h-[690px] rounded-lg border border-[#e2e8f0] bg-white px-[34px] pb-[34px] pt-[30px]">
      <div className="flex items-start gap-2"><StatusTag status={post.status} />{post.technologies.map((technology) => <TechnologyTag key={technology}>{technology}</TechnologyTag>)}<div className="ml-auto flex gap-3"><button type="button" onClick={openEdit} className="h-[42px] w-[72px] rounded-lg border border-[#bfdbfe] bg-white text-sm font-medium text-[#1d4ed8]">編集</button><button type="button" onClick={openStatusChange} className="h-[42px] w-40 rounded-md bg-[#2563eb] text-sm font-medium text-white">状態を変更</button></div></div>
      <h1 className="mt-5 text-[26px] font-bold">{post.title}</h1><p className="mt-5 text-xs text-[#64748b]">最終更新: {formatRelativeUpdateTime(post.updatedAt)}</p><div className="mt-5 border-t border-[#e2e8f0] pt-5"><h2 className="text-[15px] font-bold text-[#334155]">内容</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#334155]">{post.content}</p></div>
      {post.status !== "open" && post.resolution ? <div className={`mt-6 rounded-md border px-4 py-3.5 ${post.status === "resolved" ? "border-[#a7f3d0] bg-[#ecfdf5]" : "border-[#cbd5e1] bg-[#f8fafc]"}`}><h2 className={`text-[13px] font-bold ${post.status === "resolved" ? "text-[#047857]" : "text-[#475569]"}`}>{POST_STATUS_LABELS[post.status]}の判断・対応メモ</h2><p className="mt-1.5 text-sm text-[#334155]">{post.resolution}</p></div> : <div className="mt-6 rounded-md border border-[#cfe0ff] bg-[#f5f9ff] px-4 py-3.5"><h2 className="text-[13px] font-bold text-[#1d4ed8]">状況が分かったら</h2><p className="mt-1.5 text-[13px] text-[#475569]">「状態を変更」から判断・対応メモを残すと、横断ナレッジに表示されます。</p></div>}
    </article></main>
    {editing ? <Modal title="投稿を編集" description="内容と技術タグを修正できます。" onClose={() => setEditing(false)} width="max-w-[680px]"><form onSubmit={submitEdit} className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-medium">タイトル　必須</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-md border border-[#cbd5e1] px-4 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /></label><div><p className="mb-2 text-sm font-medium">技術タグ　必須</p><TechnologyInput value={technologies} onChange={setTechnologies} /></div><label className="block"><span className="mb-2 block text-sm font-medium">内容　必須</span><textarea value={content} onChange={(event) => setContent(event.target.value)} className="h-36 w-full resize-none rounded-md border border-[#cbd5e1] px-4 py-3 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /></label>{error ? <p className="text-sm text-[#b91c1c]">{error}</p> : null}<div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setEditing(false)} className="h-[42px] rounded-md border border-[#cbd5e1] px-4 text-sm font-medium disabled:opacity-50">キャンセル</button><button type="submit" disabled={saving} className="h-[42px] rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white disabled:opacity-50">{saving ? "保存中..." : "保存する"}</button></div></form></Modal> : null}
    {changingStatus ? <Modal title="状態を変更" description="現在の扱いと、あとから再利用できる判断材料を残してください。" onClose={() => setChangingStatus(false)}><form onSubmit={submitStatus} className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-medium">ステータス　必須</span><select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as PostStatus)} className="h-11 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]">{POST_STATUSES.map((status) => <option key={status} value={status}>{POST_STATUS_LABELS[status]}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-medium">判断・対応メモ　{selectedStatus === "open" ? "任意" : "必須"}</span><textarea value={resolution} onChange={(event) => setResolution(event.target.value)} disabled={selectedStatus === "open"} placeholder="例：影響が限定的なため保留。次回の基盤更新時に再検討する" className="h-[118px] w-full resize-none rounded-md border border-[#cbd5e1] px-4 py-3 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe] disabled:bg-[#f1f5f9] disabled:text-[#94a3b8]" /></label>{error ? <p role="alert" className="text-sm text-[#b91c1c]">{error}</p> : null}<div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setChangingStatus(false)} className="h-[42px] rounded-md border border-[#cbd5e1] px-4 text-sm font-medium disabled:opacity-50">キャンセル</button><button type="submit" disabled={saving} className="h-[42px] w-32 rounded-md bg-[#2563eb] text-sm font-medium text-white disabled:opacity-50">{saving ? "保存中..." : "保存する"}</button></div></form></Modal> : null}
  </div>;
}

export default function PostDetailPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}><PostDetailPageContent /></Suspense>;
}
