import { withApiAccessLog } from "@/lib/server/access-log";
import { isPostStatus } from "@/data/models";
import { apiError, hasStrings, hasTechnologies, invalid } from "@/lib/server/http";
import { deletePost, updatePost, updatePostStatus } from "@/lib/server/repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      const input: unknown = await request.json();
      const { id } = await params;

      if (typeof input === "object" && input !== null && "status" in input) {
        if (!hasStrings(input, ["status"])) {
          return invalid("有効なステータスを選択してください。");
        }
        const status = (input as Record<string, string>).status;
        if (!isPostStatus(status)) {
          return invalid("有効なステータスを選択してください。");
        }
        const resolution = hasStrings(input, ["resolution"]) ? input.resolution.trim() : "";
        if (status !== "open" && !resolution) {
          return invalid("判断・対応メモを入力してください。");
        }
        const updatedAt = await updatePostStatus(id, status, resolution || null);
        if (!updatedAt) {
          return Response.json({ error: "投稿が見つかりません。" }, { status: 404 });
        }
        return Response.json({
          status,
          resolution: resolution || undefined,
          updatedAt,
        });
      }

      if (!hasStrings(input, ["title", "content"]) || !hasTechnologies(input)) {
        return invalid("タイトル、内容、技術タグを入力してください。");
      }
      if (!input.title.trim() || !input.content.trim()) {
        return invalid("タイトルと内容を入力してください。");
      }
      const updatedAt = await updatePost(id, {
        title: input.title.trim(),
        content: input.content.trim(),
        technologies: input.technologies.map((item) => item.trim()),
      });
      if (!updatedAt) {
        return Response.json({ error: "投稿が見つかりません。" }, { status: 404 });
      }
      return Response.json({ updated: true, updatedAt });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      const { id } = await params;
      const deleted = await deletePost(id);
      if (!deleted) {
        return Response.json({ error: "投稿が見つかりません。" }, { status: 404 });
      }
      return Response.json({ deleted: true });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}
