"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/modal";
import { SiteHeader } from "@/components/site-header";
import { TechnologyInput } from "@/components/technology-input";
import { TechnologyTag } from "@/components/ui";
import { useAppStore } from "@/lib/app-store";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, posts, createProject } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || technologies.length === 0) {
      setError("プロジェクト名と使用技術を入力してください。");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const id = await createProject({ name: name.trim(), description: description.trim() || "プロジェクトの記録", technologies });
      setShowCreate(false);
      router.push(`/projects/${id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "プロジェクトを作成できませんでした。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1120px] pb-16 pt-10">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setShowCreate(true)} className="ml-auto h-[42px] w-[188px] rounded-md bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2">新しいプロジェクト</button>
        </div>

        {projects.length > 0 ? <div className="mt-6 flex flex-col gap-3">{projects.map((project) => {
          const projectPosts = posts.filter((post) => post.projectId === project.id);
          const openCount = projectPosts.filter((post) => post.status === "open").length;
          const resolvedCount = projectPosts.length - openCount;
          return <Link key={project.id} href={`/projects/${project.id}`} className="group flex h-[164px] flex-col gap-2.5 rounded-lg border border-[#e2e8f0] bg-white px-6 py-5 transition hover:border-[#bfdbfe] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">
            <div className="flex items-center gap-3"><h2 className="text-lg font-bold">{project.name}</h2><span className="ml-auto text-xs font-medium text-[#c2410c]">未解決 {openCount}件</span><span className="text-xs font-medium text-[#047857]">解決済み {resolvedCount}件</span></div>
            <p className="text-sm leading-6 text-[#475569]">{project.description}</p>
            <div className="flex gap-2">{project.technologies.map((technology) => <TechnologyTag key={technology}>{technology}</TechnologyTag>)}</div>
            <p className="mt-auto text-xs text-[#64748b]">最終更新 {project.updatedLabel}</p>
          </Link>;
        })}</div> : <div className="mt-6 rounded-lg border border-[#e2e8f0] bg-white px-8 py-14 text-center"><h2 className="font-bold">プロジェクトがありません</h2><p className="mt-2 text-sm text-[#64748b]">最初のプロジェクトを作成すると、チームのつまずきを記録できます。</p></div>}
      </main>

      {showCreate ? <Modal title="新しいプロジェクト" description="使用する技術と目的を登録します。" onClose={() => setShowCreate(false)}><form onSubmit={submit} className="space-y-5">
        <label className="block"><span className="mb-2 block text-sm font-medium text-[#334155]">プロジェクト名　必須</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="例：AWS研修" className="h-11 w-full rounded-md border border-[#cbd5e1] px-4 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" autoFocus /></label>
        <label className="block"><span className="mb-2 block text-sm font-medium text-[#334155]">説明　任意</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="プロジェクトの目的を入力" className="h-[86px] w-full resize-none rounded-md border border-[#cbd5e1] px-4 py-3 text-sm outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /></label>
        <div><p className="mb-2 text-sm font-medium text-[#334155]">使用技術　必須</p><TechnologyInput value={technologies} onChange={setTechnologies} /></div>
        {error ? <p role="alert" className="text-sm text-[#b91c1c]">{error}</p> : null}
        <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowCreate(false)} disabled={submitting} className="h-[42px] rounded-md border border-[#cbd5e1] bg-white px-4 text-sm font-medium text-[#334155] disabled:opacity-50">キャンセル</button><button type="submit" disabled={submitting} className="h-[42px] rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white disabled:opacity-50">{submitting ? "作成中..." : "作成する"}</button></div>
      </form></Modal> : null}
    </div>
  );
}
