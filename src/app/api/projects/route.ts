import { withApiAccessLog } from "@/lib/server/access-log";
import { apiError, hasStrings, hasTechnologies, invalid } from "@/lib/server/http";
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
      const input: unknown = await request.json();
      if (!hasStrings(input, ["name", "description"]) || !hasTechnologies(input)) {
        return invalid("プロジェクト名、説明、使用技術を入力してください。");
      }
      if (!input.name.trim() || !input.description.trim()) {
        return invalid("プロジェクト名と説明を入力してください。");
      }

      const project = await createProject({
        name: input.name.trim(),
        description: input.description.trim(),
        technologies: input.technologies.map((item) => item.trim()),
      });
      return Response.json({ project }, { status: 201 });
    } catch (error) {
      return apiError(error, requestId);
    }
  });
}
