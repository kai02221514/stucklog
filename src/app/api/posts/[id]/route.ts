import { withApiAccessLog } from "@/lib/server/access-log";
import { isPostStatus } from "@/data/models";
import { INPUT_LIMITS } from "@/lib/input-limits";
import { apiError, invalid } from "@/lib/server/http";
import { asRecord, optionalString, readJsonBody, requiredString, technologies } from "@/lib/server/request-validation";
import { deletePost, updatePost, updatePostStatus } from "@/lib/server/repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      const parsed = await readJsonBody(request);
      if (!parsed.ok) return parsed.response;
      const input = asRecord(parsed.value);
      if (!input) return invalid("送信データを確認してください。");
      const { id } = await params;
      const validatedPostId = requiredString(id, "投稿ID", INPUT_LIMITS.postId);
      if (!validatedPostId.ok) return validatedPostId.response;

      if ("status" in input) {
        if (typeof input.status !== "string") {
          return invalid("有効なステータスを選択してください。");
        }
        const status = input.status;
        if (!isPostStatus(status)) {
          return invalid("有効なステータスを選択してください。");
        }
        const resolution = optionalString(input.resolution, "判断・対応メモ", INPUT_LIMITS.resolution);
        if (!resolution.ok) return resolution.response;
        if (status !== "open" && !resolution.value) {
          return invalid("判断・対応メモを入力してください。");
        }
        const updatedAt = await updatePostStatus(
          validatedPostId.value,
          status,
          resolution.value || null,
        );
        if (!updatedAt) {
          return Response.json({ error: "投稿が見つかりません。" }, { status: 404 });
        }
        return Response.json({
          status,
          resolution: resolution.value || undefined,
          updatedAt,
        });
      }

      const title = requiredString(input.title, "タイトル", INPUT_LIMITS.postTitle);
      if (!title.ok) return title.response;
      const content = requiredString(input.content, "内容", INPUT_LIMITS.postContent);
      if (!content.ok) return content.response;
      const technologyList = technologies(input.technologies);
      if (!technologyList.ok) return technologyList.response;
      const updatedAt = await updatePost(validatedPostId.value, {
        title: title.value,
        content: content.value,
        technologies: technologyList.value,
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
      const validatedPostId = requiredString(id, "投稿ID", INPUT_LIMITS.postId);
      if (!validatedPostId.ok) return validatedPostId.response;
      const deleted = await deletePost(validatedPostId.value);
      if (!deleted) {
        return Response.json({ error: "投稿が見つかりません。" }, { status: 404 });
      }
      return Response.json({ deleted: true });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}
