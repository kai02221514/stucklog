"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { useDemoPosts } from "@/lib/demo-post-store";

export default function NewPostPage() {
  const router = useRouter();
  const { addPost } = useDemoPosts();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // DEMO: addPostはサーバー送信ではなくブラウザ内のデモストアへ保存します。
    // 本実装ではAPI成功後に、返却されたIDの詳細画面へ遷移させます。
    const newPost = addPost({
      title: title.trim(),
      tags: tags.split(/[,、]/).map((tag) => tag.trim()).filter(Boolean),
      content: content.trim(),
    });
    router.push(`/posts/${newPost.id}`);
  };

  const inputClass =
    "mt-2 w-full rounded-md border border-[#cbd5e1] bg-white px-4 text-sm text-[#334155] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <SiteHeader active="new" />
      <main className="mx-auto w-full max-w-[840px] pb-16 pt-11">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.01em]">
            新しく投稿
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">
            つまずいた内容を、あとから探せる形で残します。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-[#e2e8f0] bg-white px-8 py-7">
          <div>
            <label htmlFor="title" className="text-sm font-medium text-[#334155]">
              タイトル <span className="ml-1 text-[11px] text-[#1d4ed8]">必須</span>
            </label>
            <input id="title" required value={title} onChange={(event) => setTitle(event.target.value)}
              placeholder="例：DynamoDBへの書き込みが失敗する" className={`${inputClass} h-11`} />
          </div>
          <div className="mt-6">
            <label htmlFor="tags" className="text-sm font-medium text-[#334155]">
              技術タグ <span className="ml-1 text-[11px] text-[#1d4ed8]">必須</span>
            </label>
            <input id="tags" required value={tags} onChange={(event) => setTags(event.target.value)}
              placeholder="例：AWS, DynamoDB（カンマ区切り）" className={`${inputClass} h-11`} />
          </div>
          <div className="mt-6">
            <label htmlFor="content" className="text-sm font-medium text-[#334155]">
              内容 <span className="ml-1 text-[11px] text-[#1d4ed8]">必須</span>
            </label>
            <textarea id="content" required value={content} onChange={(event) => setContent(event.target.value)}
              placeholder="発生したこと、試したこと、分かったことを記録してください"
              className={`${inputClass} h-[238px] resize-none py-3.5 leading-6`} />
          </div>
          <p className="mt-6 text-xs text-[#64748b]">
            機密情報やパスワードは入力しないでください。
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Link href="/" className="rounded-md border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">
              キャンセル
            </Link>
            <button type="submit" className="rounded-md bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2">
              投稿する
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
