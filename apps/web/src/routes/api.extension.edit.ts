import { createFileRoute } from "@tanstack/react-router";

const DEFAULT_MODEL = "gpt-5.3-codex";
const MAX_BODY_BYTES = 2_000_000;
const CORS_HEADERS = {
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS, POST",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json; charset=utf-8",
};

interface RepositoryFile {
  content: string;
  path: string;
}

interface ExtensionRequestBody {
  repository: { files: RepositoryFile[]; truncated?: boolean };
  request: {
    effort?: string;
    images?: Array<{ dataBase64: string; mediaType: string }>;
    model?: string;
    prompt?: string;
    [key: string]: unknown;
  };
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { headers: CORS_HEADERS, status });
}

function authorized(request: Request): boolean {
  const expected = process.env.VERLAY_EXTENSION_ACCESS_TOKEN;
  if (!expected) {
    return true;
  }
  return request.headers.get("Authorization") === `Bearer ${expected}`;
}

function validBody(value: unknown): value is ExtensionRequestBody {
  if (!value || typeof value !== "object") {
    return false;
  }
  const body = value as Partial<ExtensionRequestBody>;
  return (
    Boolean(body.request && typeof body.request === "object") &&
    Array.isArray(body.repository?.files) &&
    body.repository.files.length <= 120 &&
    body.repository.files.every(
      (file) =>
        typeof file?.path === "string" &&
        typeof file.content === "string" &&
        file.content.length <= 180_000
    )
  );
}

function repositoryPrompt(body: ExtensionRequestBody): string {
  const request = { ...body.request, images: undefined };
  const files = body.repository.files
    .map(
      (file) =>
        `<file path=${JSON.stringify(file.path)}>\n${file.content}\n</file>`
    )
    .join("\n\n");
  return [
    "Edit the supplied web project according to the selected DOM element and user request.",
    "Return the complete new content only for files that must change.",
    "Never invent or modify paths outside the supplied repository.",
    "Preserve unrelated code and existing project conventions.",
    `Selection and requested change:\n${JSON.stringify(request, null, 2)}`,
    `Repository files${body.repository.truncated ? " (size-limited selection)" : ""}:\n${files}`,
  ].join("\n\n");
}

function responseText(payload: Record<string, unknown>): string {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }
  const output = Array.isArray(payload.output) ? payload.output : [];
  return output
    .filter((item): item is { type: string; content?: unknown[] } =>
      Boolean(item && typeof item === "object" && "type" in item)
    )
    .filter((item) => item.type === "message")
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((item): item is { type: string; text: string } =>
      Boolean(
        item &&
          typeof item === "object" &&
          "type" in item &&
          "text" in item &&
          typeof item.text === "string"
      )
    )
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("");
}

async function edit(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return json({ error: "访问令牌无效" }, 401);
  }
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ error: "项目上下文超过 2 MB 上限" }, 413);
  }

  const body = await request.json().catch(() => null);
  if (!validBody(body)) {
    return json({ error: "扩展请求格式无效" }, 400);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "服务端尚未配置 OPENAI_API_KEY" }, 503);
  }

  const model = process.env.VERLAY_CODEX_MODEL || DEFAULT_MODEL;
  const content: Record<string, string>[] = [
    { text: repositoryPrompt(body), type: "input_text" },
  ];
  for (const image of body.request.images?.slice(0, 3) || []) {
    if (
      typeof image.dataBase64 === "string" &&
      typeof image.mediaType === "string" &&
      image.dataBase64.length <= 5_000_000
    ) {
      content.push({
        image_url: `data:${image.mediaType};base64,${image.dataBase64}`,
        type: "input_image",
      });
    }
  }

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [{ content, role: "user" }],
      instructions:
        "You are the coding engine for Verlay. Make minimal, production-quality frontend edits and return only the requested structured result.",
      max_output_tokens: 32_000,
      model,
      reasoning: { effort: "low" },
      store: false,
      text: {
        format: {
          name: "verlay_repository_edit",
          schema: {
            additionalProperties: false,
            properties: {
              changes: {
                items: {
                  additionalProperties: false,
                  properties: {
                    content: { type: "string" },
                    path: { type: "string" },
                  },
                  required: ["path", "content"],
                  type: "object",
                },
                maxItems: 30,
                type: "array",
              },
              followUps: {
                items: { type: "string" },
                maxItems: 3,
                type: "array",
              },
              summary: { type: "string" },
            },
            required: ["summary", "followUps", "changes"],
            type: "object",
          },
          strict: true,
          type: "json_schema",
        },
        verbosity: "low",
      },
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await openaiResponse.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!(openaiResponse.ok && payload)) {
    const detail = payload?.error as { message?: string } | undefined;
    return json(
      {
        error: detail?.message || `OpenAI 请求失败（${openaiResponse.status}）`,
      },
      502
    );
  }

  try {
    const result = JSON.parse(responseText(payload));
    return json({
      ...result,
      model,
      usage: payload.usage
        ? {
            inputTokens: (payload.usage as { input_tokens?: number })
              .input_tokens,
            outputTokens: (payload.usage as { output_tokens?: number })
              .output_tokens,
          }
        : undefined,
    });
  } catch {
    return json({ error: "Codex 没有返回有效的结构化修改" }, 502);
  }
}

export const Route = createFileRoute("/api/extension/edit")({
  server: {
    handlers: {
      GET: ({ request }) => {
        if (!authorized(request)) {
          return json({ error: "访问令牌无效" }, 401);
        }
        return json({
          model: process.env.VERLAY_CODEX_MODEL || DEFAULT_MODEL,
          ok: true,
        });
      },
      OPTIONS: () => new Response(null, { headers: CORS_HEADERS }),
      POST: ({ request }) => edit(request),
    },
  },
});
