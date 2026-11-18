import "server-only";

import { INPUT_LIMITS } from "@/lib/input-limits";
import { invalid } from "@/lib/server/http";

const MAX_JSON_BODY_BYTES = 64 * 1024;

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; response: Response };

function payloadTooLarge() {
  return Response.json(
    { error: "送信データが大きすぎます。入力内容を短くしてください。" },
    { status: 413 },
  );
}

export async function readJsonBody(request: Request): Promise<ValidationResult<unknown>> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return {
      ok: false,
      response: Response.json(
        { error: "Content-Typeにapplication/jsonを指定してください。" },
        { status: 415 },
      ),
    };
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredBytes = Number(contentLength);
    if (Number.isFinite(declaredBytes) && declaredBytes > MAX_JSON_BODY_BYTES) {
      return { ok: false, response: payloadTooLarge() };
    }
  }

  if (!request.body) {
    return { ok: false, response: invalid("JSON形式の送信データを入力してください。") };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let receivedBytes = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > MAX_JSON_BODY_BYTES) {
        await reader.cancel();
        return { ok: false, response: payloadTooLarge() };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();

    try {
      return { ok: true, value: JSON.parse(text) as unknown };
    } catch {
      return { ok: false, response: invalid("JSON形式の送信データが正しくありません。") };
    }
  } catch {
    return { ok: false, response: invalid("送信データを読み取れませんでした。") };
  } finally {
    reader.releaseLock();
  }
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function requiredString(
  value: unknown,
  label: string,
  maxLength: number,
): ValidationResult<string> {
  if (typeof value !== "string" || !value.trim()) {
    return { ok: false, response: invalid(`${label}を入力してください。`) };
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    return {
      ok: false,
      response: invalid(`${label}は${maxLength.toLocaleString("ja-JP")}文字以内で入力してください。`),
    };
  }
  return { ok: true, value: normalized };
}

export function optionalString(
  value: unknown,
  label: string,
  maxLength: number,
): ValidationResult<string> {
  if (value === undefined) return { ok: true, value: "" };
  if (typeof value !== "string") {
    return { ok: false, response: invalid(`${label}を文字列で入力してください。`) };
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    return {
      ok: false,
      response: invalid(`${label}は${maxLength.toLocaleString("ja-JP")}文字以内で入力してください。`),
    };
  }
  return { ok: true, value: normalized };
}

export function technologies(value: unknown): ValidationResult<string[]> {
  if (!Array.isArray(value) || value.length === 0) {
    return { ok: false, response: invalid("技術タグを1件以上入力してください。") };
  }
  if (value.length > INPUT_LIMITS.technologies) {
    return {
      ok: false,
      response: invalid(`技術タグは最大${INPUT_LIMITS.technologies}件まで入力できます。`),
    };
  }

  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      return { ok: false, response: invalid("空の技術タグは登録できません。") };
    }
    const technology = item.trim();
    if (technology.length > INPUT_LIMITS.technology) {
      return {
        ok: false,
        response: invalid(`技術タグは1件${INPUT_LIMITS.technology}文字以内で入力してください。`),
      };
    }

    const key = technology.toLocaleLowerCase("ja-JP");
    if (seen.has(key)) {
      return { ok: false, response: invalid("同じ技術タグは重複登録できません。") };
    }
    seen.add(key);
    normalized.push(technology);
  }
  return { ok: true, value: normalized };
}
