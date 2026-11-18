export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  updatedAt: string;
};

export const POST_STATUSES = [
  "open",
  "resolved",
  "on_hold",
  "not_cost_effective",
  "external_dependency",
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  open: "未解決",
  resolved: "解決済み",
  on_hold: "保留",
  not_cost_effective: "対応コスト過大",
  external_dependency: "外部要因待ち",
};

export const KNOWLEDGE_STATUSES = POST_STATUSES.filter(
  (status): status is Exclude<PostStatus, "open"> => status !== "open",
);

export function isPostStatus(value: string): value is PostStatus {
  return POST_STATUSES.some((status) => status === value);
}

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
