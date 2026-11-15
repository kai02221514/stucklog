"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { demoPosts, type Post } from "@/data/demo-posts";

type NewPostInput = Pick<Post, "title" | "tags" | "content">;
type DemoPostsContextValue = {
  posts: Post[];
  addPost: (input: NewPostInput) => Post;
  findPost: (id: string) => Post | undefined;
};

const STORAGE_KEY = "stucklog-demo-posts";
const DemoPostsContext = createContext<DemoPostsContextValue | null>(null);

export function DemoPostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(demoPosts);

  useEffect(() => {
    // DEMO: バックエンドの読み込みを再現するため、ブラウザ保存を利用しています。
    // AWS接続時は、ここを一覧取得APIの呼び出しへ置き換えます。
    const savedPosts = window.localStorage.getItem(STORAGE_KEY);
    if (!savedPosts) return;

    const restoreTimer = window.setTimeout(() => {
      try {
        setPosts(JSON.parse(savedPosts) as Post[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  const addPost = useCallback((input: NewPostInput) => {
    const newPost: Post = {
      ...input,
      id: `demo-${Date.now()}`,
      summary:
        input.content.length > 90
          ? `${input.content.slice(0, 90)}…`
          : input.content,
      createdLabel: "たった今",
      createdAt: new Date().toISOString(),
    };

    setPosts((currentPosts) => {
      const nextPosts = [newPost, ...currentPosts];
      // DEMO: 投稿APIへの送信を再現し、localStorageへ保存しています。
      // AWS接続時は、API Gateway/Lambda経由のDynamoDB書き込みへ置き換えます。
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPosts));
      return nextPosts;
    });
    return newPost;
  }, []);

  const findPost = useCallback(
    (id: string) => posts.find((post) => post.id === id),
    [posts],
  );
  const value = useMemo(
    () => ({ posts, addPost, findPost }),
    [posts, addPost, findPost],
  );

  return (
    <DemoPostsContext.Provider value={value}>
      {children}
    </DemoPostsContext.Provider>
  );
}

export function useDemoPosts() {
  const context = useContext(DemoPostsContext);
  if (!context) {
    throw new Error("useDemoPosts must be used inside DemoPostsProvider");
  }
  return context;
}
