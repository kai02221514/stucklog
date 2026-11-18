import { withApiAccessLog } from "@/lib/server/access-log";
import { INPUT_LIMITS } from "@/lib/input-limits";
import { apiError, invalid } from "@/lib/server/http";
import { asRecord, readJsonBody, requiredString, technologies } from "@/lib/server/request-validation";
import { createProject, listProjects } from "@/lib/server/repository";

export async function GET(request: Request) {
  return withApiAccessLog(request, async ({ requestId }) => {
    try {
      return Response.json({ projects: await listProjects() });
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
        return invalid("プロジェクト名、説明、使用技術を入力してください。");
      }

      const name = requiredString(input.name, "プロジェクト名", INPUT_LIMITS.projectName);
      if (!name.ok) return name.response;
      const description = requiredString(
        input.description,
        "プロジェクトの説明",
        INPUT_LIMITS.projectDescription,
      );
      if (!description.ok) return description.response;
      const technologyList = technologies(input.technologies);
      if (!technologyList.ok) return technologyList.response;

      const project = await createProject({
        name: name.value,
        description: description.value,
        technologies: technologyList.value,
      });
      return Response.json({ project }, { status: 201 });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}
