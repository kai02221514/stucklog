import { withApiAccessLog } from "@/lib/server/access-log";
import { apiError, hasStrings, hasTechnologies, invalid } from "@/lib/server/http";
import { resolvePost, updatePost } from "@/lib/server/repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      const input: unknown = await request.json();
      const { id } = await params;

      if (hasStrings(input, ["resolution"])) {
        if (!input.resolution.trim()) return invalid("解決メモを入力してください。");
        const updatedAt = await resolvePost(id, input.resolution.trim());
        if (!updatedAt) {
          return Response.json({ error: "投稿が見つかりません。" }, { status: 404 });
        }
        return Response.json({ status: "resolved", resolution: input.resolution.trim(), updatedAt });
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
