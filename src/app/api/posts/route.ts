import { withApiAccessLog } from "@/lib/server/access-log";
import { apiError, hasStrings, hasTechnologies, invalid } from "@/lib/server/http";
import { createPost, listPosts } from "@/lib/server/repository";

export async function GET(request: Request) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      return Response.json({ posts: await listPosts() });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}

export async function POST(request: Request) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      const input: unknown = await request.json();
      if (!hasStrings(input, ["projectId", "title", "content"]) || !hasTechnologies(input)) {
        return invalid("プロジェクト、タイトル、内容、技術タグを入力してください。");
      }
      if (!input.projectId.trim() || !input.title.trim() || !input.content.trim()) {
        return invalid("プロジェクト、タイトル、内容を入力してください。");
      }

      const post = await createPost({
        projectId: input.projectId,
        title: input.title.trim(),
        content: input.content.trim(),
        technologies: input.technologies.map((item) => item.trim()),
      });
      return Response.json({ post }, { status: 201 });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}
