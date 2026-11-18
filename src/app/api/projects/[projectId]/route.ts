import { withApiAccessLog } from "@/lib/server/access-log";
import { INPUT_LIMITS } from "@/lib/input-limits";
import { apiError } from "@/lib/server/http";
import { asRecord, readJsonBody, requiredString, technologies } from "@/lib/server/request-validation";
import { deleteProject, updateProjectTechnologies } from "@/lib/server/repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      const parsed = await readJsonBody(request);
      if (!parsed.ok) return parsed.response;
      const input = asRecord(parsed.value);
      const technologyList = technologies(input?.technologies);
      if (!technologyList.ok) return technologyList.response;

      const { projectId } = await params;
      const validatedProjectId = requiredString(
        projectId,
        "プロジェクトID",
        INPUT_LIMITS.projectId,
      );
      if (!validatedProjectId.ok) return validatedProjectId.response;
      const updatedAt = await updateProjectTechnologies(
        validatedProjectId.value,
        technologyList.value,
      );
      if (!updatedAt) {
        return Response.json({ error: "プロジェクトが見つかりません。" }, { status: 404 });
      }
      return Response.json({ technologies: technologyList.value, updatedAt });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      const { projectId } = await params;
      const validatedProjectId = requiredString(
        projectId,
        "プロジェクトID",
        INPUT_LIMITS.projectId,
      );
      if (!validatedProjectId.ok) return validatedProjectId.response;
      const deleted = await deleteProject(validatedProjectId.value);
      if (!deleted) {
        return Response.json({ error: "プロジェクトが見つかりません。" }, { status: 404 });
      }
      return Response.json({ deleted: true });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}
