"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { TechnologyInput } from "@/components/technology-input";
import { useDemoStore } from "@/lib/demo-store";

function NewPostPageContent() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, createPost } = useDemoStore();
  const project = projects.find((item) => item.id === projectId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [technologies, setTechnologies] = useState<string[]>(project?.technologies.slice(0, 1) ?? []);
  const [error, setError] = useState("");

  if (!project) return <div className="min-h-screen bg-[#f8fafc]"><SiteHeader /><main className="mx-auto max-w-[840px] py-16"><p>プロジェクトが見つかりません。</p><Link href="/" className="text-[#1d4ed8]">一覧へ戻る</Link></main></div>;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim() || technologies.length === 0) { setError("タイトル、技術タグ、内容を入力してください。"); return; }
    const id = createPost({ projectId: project.id, title: title.trim(), content: content.trim(), technologies });
    router.push(`/posts/${id}`);
  };

  return <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]"><SiteHeader /><main className="mx-auto w-full max-w-[840px] pb-12 pt-9"><p className="text-xs text-[#64748b]">{project.name}　/　新しく投稿</p><div className="mt-5"><h1 className="text-[28px] font-bold">新しく投稿</h1><p className="mt-1.5 text-sm text-[#64748b]">{project.name}で発生したつまずきを記録します。</p></div>
    <form onSubmit={submit} className="mt-5 space-y-5 rounded-lg border border-[#e2e8f0] bg-white px-8 py-[26px]">
      <label className="block"><span className="mb-2 block text-sm font-medium text-[#334155]">プロジェクト</span><input value={project.name} readOnly className="h-11 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-4 text-sm text-[#64748b]" /></label>
      <label className="block"><span className="mb-2 block text-sm font-medium text-[#334155]">タイトル　必須</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例：DynamoDBへの書き込みが失敗する" className="h-11 w-full rounded-md border border-[#cbd5e1] px-4 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" autoFocus /></label>
      <div><p className="mb-2 text-sm font-medium text-[#334155]">技術タグ　必須</p><TechnologyInput value={technologies} onChange={setTechnologies} helper="プロジェクトの使用技術から選ぶか、新しく追加できます" /></div>
      <label className="block"><span className="mb-2 block text-sm font-medium text-[#334155]">内容　必須</span><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="発生したこと、試したこと、分かったことを記録してください" className="h-[170px] w-full resize-none rounded-md border border-[#cbd5e1] px-4 py-3 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /></label>
      {error ? <p role="alert" className="text-sm text-[#b91c1c]">{error}</p> : null}<div className="flex justify-end gap-3"><Link href={`/projects/${project.id}`} className="flex h-[42px] items-center rounded-md border border-[#cbd5e1] px-4 text-sm font-medium text-[#334155]">キャンセル</Link><button type="submit" className="h-[42px] rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white">投稿する</button></div>
    </form></main></div>;
}

export default function NewPostPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}><NewPostPageContent /></Suspense>;
}
