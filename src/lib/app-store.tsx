"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import type { Post, Project } from "@/data/demo-data";

type NewProject = Pick<Project, "name" | "description" | "technologies">;
type NewPost = Pick<Post, "projectId" | "title" | "content" | "technologies">;
type PostUpdate = Pick<Post, "title" | "content" | "technologies">;

type AppStore = {
  projects: Project[];
  posts: Post[];
  createProject: (input: NewProject) => Promise<string>;
  updateProjectTechnologies: (projectId: string, technologies: string[]) => Promise<void>;
  createPost: (input: NewPost) => Promise<string>;
  updatePost: (postId: string, input: PostUpdate) => Promise<void>;
  resolvePost: (postId: string, resolution: string) => Promise<void>;
};

const AppStoreContext = createContext<AppStore | null>(null);

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "サーバーとの通信に失敗しました。");
  return body;
}

async function fetchAll() {
  return Promise.all([
    requestJson<{ projects: Project[] }>("/api/projects"),
    requestJson<{ posts: Post[] }>("/api/posts"),
  ]);
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const retry = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [projectResponse, postResponse] = await fetchAll();
      setProjects(projectResponse.projects);
      setPosts(postResponse.posts);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "データの読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchAll()
      .then(([projectResponse, postResponse]) => {
        if (cancelled) return;
        setProjects(projectResponse.projects);
        setPosts(postResponse.posts);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "データの読み込みに失敗しました。");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      projects,
      posts,
      async createProject(input) {
        const { project } = await requestJson<{ project: Project }>("/api/projects", {
          method: "POST",
          body: JSON.stringify(input),
        });
        setProjects((current) => [project, ...current]);
        return project.id;
      },
      async updateProjectTechnologies(projectId, technologies) {
        await requestJson(`/api/projects/${encodeURIComponent(projectId)}`, {
          method: "PATCH",
          body: JSON.stringify({ technologies }),
        });
        setProjects((current) =>
          current.map((project) =>
            project.id === projectId
              ? { ...project, technologies, updatedLabel: "たった今" }
              : project,
          ),
        );
      },
      async createPost(input) {
        const { post } = await requestJson<{ post: Post }>("/api/posts", {
          method: "POST",
          body: JSON.stringify(input),
        });
        setPosts((current) => [post, ...current]);
        return post.id;
      },
      async updatePost(postId, input) {
        await requestJson(`/api/posts/${encodeURIComponent(postId)}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        });
        const normalized = input.content.replace(/\s+/g, " ").trim();
        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  ...input,
                  summary: normalized.length > 70 ? `${normalized.slice(0, 70)}…` : normalized,
                }
              : post,
          ),
        );
      },
      async resolvePost(postId, resolution) {
        await requestJson(`/api/posts/${encodeURIComponent(postId)}`, {
          method: "PATCH",
          body: JSON.stringify({ resolution }),
        });
        setPosts((current) =>
          current.map((post) =>
            post.id === postId ? { ...post, status: "resolved", resolution } : post,
          ),
        );
      },
    }),
    [posts, projects],
  );

  if (loading) {
    return <div className="min-h-screen bg-[#f8fafc]"><SiteHeader /><main className="mx-auto max-w-[1120px] py-16 text-sm text-[#64748b]">データを読み込んでいます...</main></div>;
  }

  if (loadError) {
    return <div className="min-h-screen bg-[#f8fafc]"><SiteHeader /><main className="mx-auto max-w-[1120px] py-16"><div className="rounded-lg border border-[#fecaca] bg-white px-8 py-12 text-center"><h1 className="font-bold text-[#991b1b]">データを読み込めませんでした</h1><p className="mt-2 text-sm text-[#64748b]">{loadError}</p><button type="button" onClick={() => void retry()} className="mt-5 h-10 rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white">再試行する</button></div></main></div>;
  }

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}
