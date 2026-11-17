export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  updatedAt: string;
};

export type PostStatus = "open" | "resolved";

export type Post = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  summary: string;
  technologies: string[];
  status: PostStatus;
  resolution?: string;
  author: string;
  updatedAt: string;
};
