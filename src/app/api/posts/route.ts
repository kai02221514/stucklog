import { withApiAccessLog } from "@/lib/server/access-log";
import { INPUT_LIMITS } from "@/lib/input-limits";
import { apiError, invalid } from "@/lib/server/http";
import { asRecord, readJsonBody, requiredString, technologies } from "@/lib/server/request-validation";
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
      const parsed = await readJsonBody(request);
      if (!parsed.ok) return parsed.response;
      const input = asRecord(parsed.value);
      if (!input) {
        return invalid("プロジェクト、タイトル、内容、技術タグを入力してください。");
      }

      const projectId = requiredString(input.projectId, "プロジェクト", INPUT_LIMITS.projectId);
      if (!projectId.ok) return projectId.response;
      const title = requiredString(input.title, "タイトル", INPUT_LIMITS.postTitle);
      if (!title.ok) return title.response;
      const content = requiredString(input.content, "内容", INPUT_LIMITS.postContent);
      if (!content.ok) return content.response;
      const technologyList = technologies(input.technologies);
      if (!technologyList.ok) return technologyList.response;

      const post = await createPost({
        projectId: projectId.value,
        title: title.value,
        content: content.value,
        technologies: technologyList.value,
      });
      return Response.json({ post }, { status: 201 });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}
