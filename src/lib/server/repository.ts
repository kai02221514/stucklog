import "server-only";

import { randomUUID } from "node:crypto";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import type { Post, Project } from "@/data/models";
import { getPool } from "@/lib/server/db";

type ProjectRow = RowDataPacket & {
  id: string;
  name: string;
  description: string;
  updatedAt: Date;
};

type PostRow = RowDataPacket & {
  id: string;
  projectId: string;
  title: string;
  content: string;
  summary: string;
  status: Post["status"];
  resolution: string | null;
  author: string;
  updatedAt: Date;
};

type UpdatedAtRow = RowDataPacket & {
  updatedAt: Date;
};

type TechnologyRow = RowDataPacket & {
  ownerId: string;
  technology: string;
};

export type NewProject = Pick<Project, "name" | "description" | "technologies">;
export type NewPost = Pick<Post, "projectId" | "title" | "content" | "technologies">;
export type PostUpdate = Pick<Post, "title" | "content" | "technologies">;

function toIsoString(value: Date | string) {
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

async function findUpdatedAt(connection: PoolConnection, table: "projects" | "posts", id: string) {
  const [rows] = await connection.query<UpdatedAtRow[]>(
    `SELECT updated_at AS updatedAt FROM ${table} WHERE id = ?`,
    [id],
  );
  return rows[0] ? toIsoString(rows[0].updatedAt) : null;
}

function summaryFrom(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > 70 ? `${normalized.slice(0, 70)}…` : normalized;
}

function groupTechnologies(rows: TechnologyRow[]) {
  return rows.reduce<Map<string, string[]>>((result, row) => {
    result.set(row.ownerId, [...(result.get(row.ownerId) ?? []), row.technology]);
    return result;
  }, new Map());
}

async function replaceTechnologies(
  connection: PoolConnection,
  table: "project_technologies" | "post_technologies",
  ownerColumn: "project_id" | "post_id",
  ownerId: string,
  technologies: string[],
) {
  await connection.execute(`DELETE FROM ${table} WHERE ${ownerColumn} = ?`, [ownerId]);

  for (const [index, technology] of technologies.entries()) {
    await connection.execute(
      `INSERT INTO ${table} (${ownerColumn}, technology, sort_order) VALUES (?, ?, ?)`,
      [ownerId, technology, index],
    );
  }
}

export async function listProjects(): Promise<Project[]> {
  const pool = getPool();
  const [projectRows] = await pool.query<ProjectRow[]>(
    "SELECT id, name, description, updated_at AS updatedAt FROM projects ORDER BY updated_at DESC",
  );
  const [technologyRows] = await pool.query<TechnologyRow[]>(
    "SELECT project_id AS ownerId, technology FROM project_technologies ORDER BY sort_order",
  );
  const technologies = groupTechnologies(technologyRows);

  return projectRows.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    technologies: technologies.get(project.id) ?? [],
    updatedAt: toIsoString(project.updatedAt),
  }));
}

export async function createProject(input: NewProject): Promise<Project> {
  const connection = await getPool().getConnection();
  const id = `project-${randomUUID()}`;

  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO projects (id, name, description) VALUES (?, ?, ?)",
      [id, input.name, input.description],
    );
    await replaceTechnologies(
      connection,
      "project_technologies",
      "project_id",
      id,
      input.technologies,
    );
    const updatedAt = await findUpdatedAt(connection, "projects", id);
    if (!updatedAt) throw new Error("作成したプロジェクトの更新日時を取得できませんでした。");
    await connection.commit();
    return { ...input, id, updatedAt };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateProjectTechnologies(
  projectId: string,
  technologies: string[],
) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [projectId],
    );
    if (!("affectedRows" in result) || result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }
    await replaceTechnologies(
      connection,
      "project_technologies",
      "project_id",
      projectId,
      technologies,
    );
    const updatedAt = await findUpdatedAt(connection, "projects", projectId);
    await connection.commit();
    return updatedAt ?? false;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listPosts(): Promise<Post[]> {
  const pool = getPool();
  const [postRows] = await pool.query<PostRow[]>(
    `SELECT id, project_id AS projectId, title, content, summary, status,
      resolution, author, updated_at AS updatedAt
     FROM posts ORDER BY created_at DESC`,
  );
  const [technologyRows] = await pool.query<TechnologyRow[]>(
    "SELECT post_id AS ownerId, technology FROM post_technologies ORDER BY sort_order",
  );
  const technologies = groupTechnologies(technologyRows);

  return postRows.map((post) => ({
    id: post.id,
    projectId: post.projectId,
    title: post.title,
    content: post.content,
    summary: post.summary,
    technologies: technologies.get(post.id) ?? [],
    status: post.status,
    resolution: post.resolution ?? undefined,
    author: post.author,
    updatedAt: toIsoString(post.updatedAt),
  }));
}

export async function createPost(input: NewPost): Promise<Post> {
  const connection = await getPool().getConnection();
  const id = `post-${randomUUID()}`;
  const post: Omit<Post, "updatedAt"> = {
    ...input,
    id,
    summary: summaryFrom(input.content),
    status: "open",
    author: "北田 大海",
  };

  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO posts
        (id, project_id, title, content, summary, status, author)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, post.projectId, post.title, post.content, post.summary, post.status, post.author],
    );
    await replaceTechnologies(
      connection,
      "post_technologies",
      "post_id",
      id,
      input.technologies,
    );
    const updatedAt = await findUpdatedAt(connection, "posts", id);
    if (!updatedAt) throw new Error("作成した投稿の更新日時を取得できませんでした。");
    await connection.commit();
    return { ...post, updatedAt };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updatePost(postId: string, input: PostUpdate) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "UPDATE posts SET title = ?, content = ?, summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [input.title, input.content, summaryFrom(input.content), postId],
    );
    if (!("affectedRows" in result) || result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }
    await replaceTechnologies(
      connection,
      "post_technologies",
      "post_id",
      postId,
      input.technologies,
    );
    const updatedAt = await findUpdatedAt(connection, "posts", postId);
    await connection.commit();
    return updatedAt ?? false;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function resolvePost(postId: string, resolution: string) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "UPDATE posts SET status = 'resolved', resolution = ? WHERE id = ?",
      [resolution, postId],
    );
    if (!("affectedRows" in result) || result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }
    const updatedAt = await findUpdatedAt(connection, "posts", postId);
    await connection.commit();
    return updatedAt ?? false;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
