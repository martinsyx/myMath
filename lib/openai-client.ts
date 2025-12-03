import OpenAI from "openai";

// Codex API 配置
export const DEFAULT_VISION_MODEL = "gpt-5.1";
export const DEFAULT_BASE_URL = "https://www.right.codes/codex/v1";
export const OPENAI_API_KEY = "sk-13f2794fc1b5490a841c59247c80f162";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (!OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: DEFAULT_BASE_URL,
      defaultHeaders: {
        "User-Agent": "curl/8.10.1",
      },
    });
  }
  return client;
}

interface CodexResponseOutput {
  output?: Array<{
    content?: Array<{
      text?: string | Array<{ text?: string }>;
    }>;
  }>;
  response?: unknown;
}

interface CodexRequestBody {
  model: string;
  reasoning?: { effort: string; summary: string };
  input: Array<{
    type: string;
    role: string;
    content: Array<{
      type: string;
      text?: string;
      image_url?: string;
    }>;
  }>;
  max_output_tokens?: number;
}

export async function requestCodexResponse(body: CodexRequestBody): Promise<CodexResponseOutput> {
  if (!OPENAI_API_KEY) {
    throw new Error("Server missing OPENAI_API_KEY");
  }

  const response = await fetch(`${DEFAULT_BASE_URL}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "User-Agent": "curl/8.10.1",
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  console.log("[codex] raw response:", raw);
  if (!response.ok) {
    throw new Error(`Codex API ${response.status}: ${raw.slice(0, 300)}`);
  }

  const parsed = parseSSEPayload(raw);
  console.log("[codex] parsed response:", parsed);
  if (!parsed) {
    throw new Error("Codex API returned empty payload");
  }
  return parsed;
}

function parseSSEPayload(raw: string): CodexResponseOutput | null {
  const events = raw
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean);

  for (let i = events.length - 1; i >= 0; i -= 1) {
    const lines = events[i].split("\n");
    const dataLines = lines.filter((line) => line.startsWith("data:"));
    for (let j = dataLines.length - 1; j >= 0; j -= 1) {
      const jsonText = dataLines[j].slice(5).trim();
      if (!jsonText || jsonText === "[DONE]") continue;
      try {
        const payload = JSON.parse(jsonText);
        if (payload.response) return payload.response;
        if (payload.output) return payload;
      } catch {
        continue;
      }
    }
  }
  return null;
}

// 辅助函数：从 Codex 响应中提取文本内容
export function extractResponseText(response: CodexResponseOutput): string | null {
  const outputs = Array.isArray(response?.output) ? response.output : [];
  for (const block of outputs) {
    const parts = Array.isArray(block?.content) ? block.content : [];
    for (const part of parts) {
      if (typeof part?.text === "string" && part.text.trim()) {
        return part.text;
      }
      if (Array.isArray(part?.text)) {
        const joined = part.text.map((chunk) => chunk?.text ?? "").join("");
        if (joined.trim()) {
          return joined;
        }
      }
    }
  }
  return null;
}
