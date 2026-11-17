import { withApiAccessLog } from "@/lib/server/access-log";
import { apiError, hasTechnologies, invalid } from "@/lib/server/http";
import { updateProjectTechnologies } from "@/lib/server/repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      const input: unknown = await request.json();
      if (!hasTechnologies(input)) return invalid("使用技術を1件以上入力してください。");

      const { projectId } = await params;
      const updatedAt = await updateProjectTechnologies(
        projectId,
        input.technologies.map((item) => item.trim()),
      );
      if (!updatedAt) {
        return Response.json({ error: "プロジェクトが見つかりません。" }, { status: 404 });
      }
      return Response.json({ technologies: input.technologies, updatedAt });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}
