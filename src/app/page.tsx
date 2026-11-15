"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { PostTag } from "@/components/post-tag";
import { useDemoPosts } from "@/lib/demo-post-store";

export default function Home() {
  const { posts } = useDemoPosts();
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");
    if (!normalizedQuery) return posts;

    // DEMO: 現在はブラウザ内の配列を検索しています。
    // AWS接続時はAPI Gateway/Lambdaなどの検索API呼び出しへ置き換えます。
    return posts.filter((post) =>
      [post.title, post.summary, post.content, ...post.tags]
        .join(" ")
        .toLocaleLowerCase("ja")
        .includes(normalizedQuery),
    );
  }, [posts, query]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <SiteHeader active="list" />
      <main className="mx-auto w-full max-w-[1120px] px-6 pb-16 pt-11 xl:px-0">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.01em]">
            みんなのつまずき
          </h1>
          <p className="mt-2 text-sm text-[#64748b]">
            技術で困ったことを短く残し、あとから検索できます。
          </p>
        </div>

        <div className="flex items-start gap-3">
          <label className="sr-only" htmlFor="post-search">投稿を検索</label>
          <input
            id="post-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="タイトル・内容・技術タグを検索"
            className="h-11 min-w-0 flex-1 rounded-md border border-[#cbd5e1] bg-white px-4 text-sm text-[#334155] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]"
          />
          <Link
            href="/posts/new"
            className="flex h-11 w-44 shrink-0 items-center justify-center rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
          >
            新しく投稿
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <p className="text-[13px] font-medium text-[#475569]">
            投稿 {filteredPosts.length}件
          </p>
          <span className="text-xs text-[#94a3b8]">新しい順</span>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="mt-6 flex flex-col gap-3">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group flex min-h-[154px] flex-col gap-2.5 rounded-lg border border-[#e2e8f0] bg-white px-6 py-5 transition hover:border-[#bfdbfe] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
              >
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => <PostTag key={tag}>{tag}</PostTag>)}
                </div>
                <h2 className="text-[17px] font-bold leading-normal text-[#0f172a] group-hover:text-[#1d4ed8]">
                  {post.title}
                </h2>
                <p className="line-clamp-1 text-sm leading-6 text-[#475569]">
                  {post.summary}
                </p>
                <time className="mt-auto text-xs text-[#64748b]">
                  {post.createdLabel}
                </time>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-[#cbd5e1] bg-white px-8 py-16 text-center">
            <h2 className="text-base font-bold text-[#334155]">
              該当する投稿がありません
            </h2>
            <p className="mt-2 text-sm text-[#64748b]">
              検索語を短くするか、別の技術タグを試してください。
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-5 rounded-md border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
            >
              検索条件を戻す
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
