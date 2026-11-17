import "server-only";

import { randomUUID } from "node:crypto";

const MAX_USER_AGENT_LENGTH = 512;

export type ClientCategory =
  | "browser"
  | "command_line"
  | "api_tool"
  | "bot"
  | "unknown";

type AccessLogContext = {
  requestId: string;
};

function normalizeUserAgent(value: string | null) {
  if (!value) return null;

  const normalized = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_USER_AGENT_LENGTH);

  return normalized || null;
}

export function classifyUserAgent(userAgent: string | null): ClientCategory {
  if (!userAgent) return "unknown";

  const value = userAgent.toLowerCase();
  if (/bot|crawler|spider|slurp|headless/.test(value)) return "bot";
  if (/postmanruntime|insomnia/.test(value)) return "api_tool";
  if (/curl|wget|httpie/.test(value)) return "command_line";
  if (/mozilla|chrome|safari|firefox|edg\//.test(value)) return "browser";
  return "unknown";
}

export async function withApiAccessLog(
  request: Request,
  handler: (context: AccessLogContext) => Promise<Response>,
) {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const startedAt = performance.now();
  const userAgent = normalizeUserAgent(request.headers.get("user-agent"));
  let status = 500;

  try {
    const response = await handler({ requestId });
    status = response.status;
    response.headers.set("X-Request-Id", requestId);
    return response;
  } finally {
    const pathname = new URL(request.url).pathname;
    console.info(
      JSON.stringify({
        event: "api_access",
        timestamp,
        requestId,
        method: request.method,
        path: pathname,
        status,
        durationMs: Math.round(performance.now() - startedAt),
        clientCategory: classifyUserAgent(userAgent),
        userAgent,
      }),
    );
  }
}
