import "server-only";

export function apiError(error: unknown) {
  console.error(error);
  return Response.json(
    { error: "データベースとの通信に失敗しました。しばらくしてから再度お試しください。" },
    { status: 500 },
  );
}

export function invalid(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function hasStrings(value: unknown, keys: string[]): value is Record<string, string> {
  if (!value || typeof value !== "object") return false;
  return keys.every((key) => typeof (value as Record<string, unknown>)[key] === "string");
}

export function hasTechnologies(value: unknown): value is { technologies: string[] } {
  if (!value || typeof value !== "object") return false;
  const technologies = (value as Record<string, unknown>).technologies;
  return (
    Array.isArray(technologies) &&
    technologies.length > 0 &&
    technologies.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}
