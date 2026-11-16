import { apiError, hasTechnologies, invalid } from "@/lib/server/http";
import { updateProjectTechnologies } from "@/lib/server/repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const input: unknown = await request.json();
    if (!hasTechnologies(input)) return invalid("使用技術を1件以上入力してください。");

    const { projectId } = await params;
    const updated = await updateProjectTechnologies(
      projectId,
      input.technologies.map((item) => item.trim()),
    );
    if (!updated) return Response.json({ error: "プロジェクトが見つかりません。" }, { status: 404 });
    return Response.json({ technologies: input.technologies });
  } catch (error) {
    return apiError(error);
  }
}
