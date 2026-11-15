"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  initialPosts,
  initialProjects,
  type Post,
  type Project,
} from "@/data/demo-data";

type NewProject = Pick<Project, "name" | "description" | "technologies">;
type NewPost = Pick<
  Post,
  "projectId" | "title" | "content" | "technologies"
>;
type PostUpdate = Pick<Post, "title" | "content" | "technologies">;

type DemoStore = {
  projects: Project[];
  posts: Post[];
  createProject: (input: NewProject) => string;
  updateProjectTechnologies: (projectId: string, technologies: string[]) => void;
  createPost: (input: NewPost) => string;
  updatePost: (postId: string, input: PostUpdate) => void;
  resolvePost: (postId: string, resolution: string) => void;
};

const DemoStoreContext = createContext<DemoStore | null>(null);

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  // DEMO: AWS接続前のため、データはReactのメモリ上で管理しています。
  // 実装時は各更新処理をAPI Gateway + Lambda + DynamoDBへの呼び出しに置き換えます。
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const value = useMemo<DemoStore>(
    () => ({
      projects,
      posts,
      createProject(input) {
        const id = createId("project");
        setProjects((current) => [
          { ...input, id, updatedLabel: "たった今" },
          ...current,
        ]);
        return id;
      },
      updateProjectTechnologies(projectId, technologies) {
        setProjects((current) =>
          current.map((project) =>
            project.id === projectId
              ? { ...project, technologies, updatedLabel: "たった今" }
              : project,
          ),
        );
      },
      createPost(input) {
        const id = createId("post");
        const normalized = input.content.replace(/\s+/g, " ").trim();
        setPosts((current) => [
          {
            ...input,
            id,
            summary:
              normalized.length > 70
                ? `${normalized.slice(0, 70)}…`
                : normalized,
            status: "open",
            author: "北田 大海",
            createdLabel: "たった今",
          },
          ...current,
        ]);
        return id;
      },
      updatePost(postId, input) {
        const normalized = input.content.replace(/\s+/g, " ").trim();
        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  ...input,
                  summary:
                    normalized.length > 70
                      ? `${normalized.slice(0, 70)}…`
                      : normalized,
                }
              : post,
          ),
        );
      },
      resolvePost(postId, resolution) {
        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? { ...post, status: "resolved", resolution }
              : post,
          ),
        );
      },
    }),
    [posts, projects],
  );

  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const store = useContext(DemoStoreContext);
  if (!store) {
    throw new Error("useDemoStore must be used inside DemoStoreProvider");
  }
  return store;
}
