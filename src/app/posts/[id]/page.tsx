"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PostTag } from "@/components/post-tag";
import { SiteHeader } from "@/components/site-header";
import { useDemoPosts } from "@/lib/demo-post-store";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { findPost } = useDemoPosts();
  // DEMO: 現在はブラウザ内のデータからIDを検索しています。
  // AWS接続時は、このIDを使って投稿詳細APIを呼び出します。
  const post = findPost(id);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <SiteHeader active="list" />
      <main className="mx-auto w-full max-w-[840px] pb-16 pt-9">
        <Link href="/" className="text-[13px] font-medium text-[#1d4ed8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">
          ← 投稿一覧に戻る
        </Link>
        {post ? (
          <article className="mt-5 min-h-[640px] rounded-lg border border-[#e2e8f0] bg-white px-9 pb-9 pt-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => <PostTag key={tag}>{tag}</PostTag>)}
            </div>
            <h1 className="mt-[22px] text-[26px] font-bold leading-tight tracking-[-0.01em]">
              {post.title}
            </h1>
            <time className="mt-[22px] block text-xs text-[#64748b]">
              {post.createdLabel}
            </time>
            <div className="mt-[22px] border-t border-[#e2e8f0] pt-[22px]">
              <h2 className="text-[15px] font-bold text-[#334155]">内容</h2>
              <div className="mt-3.5 whitespace-pre-wrap text-sm leading-6 text-[#334155]">
                {post.content}
              </div>
            </div>
          </article>
        ) : (
          <div className="mt-5 rounded-lg border border-[#e2e8f0] bg-white px-9 py-20 text-center">
            <h1 className="text-lg font-bold text-[#334155]">投稿が見つかりません</h1>
            <p className="mt-2 text-sm text-[#64748b]">
              投稿が削除されたか、URLが正しくない可能性があります。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
