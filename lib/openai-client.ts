import OpenAI from "openai";

// Codex API 配置（备用方案）
export const DEFAULT_VISION_MODEL = "gpt-5.1";
export const DEFAULT_BASE_URL = "https://www.right.codes/codex/v1";
export const OPENAI_API_KEY = "sk-13f2794fc1b5490a841c59247c80f162";

// BigModel (GLM) 配置
const BIGMODEL_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const BIGMODEL_MODEL = "glm-4-flash";//"glm-4.6";
const BIGMODEL_API_KEY = "b39956fdf8fd445da86fae3ad71d1b69.1h0vUzhsMUpWwo9M";

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

type BigModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type BigModelResponseChunk = {
  choices?: Array<{
    message?: { content?: unknown };
    delta?: { content?: unknown };
  }>;
};

export async function requestBigModelChatText({
  systemPrompt,
  userPrompt,
  temperature = 1,
  stream = true,
  timeoutMs = 8000, // 默认 8 秒超时
}: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  stream?: boolean;
  timeoutMs?: number;
}): Promise<string | null> {
  if (!BIGMODEL_API_KEY) {
    throw new Error("Server missing BigModel API key");
  }

  const body = {
    model: BIGMODEL_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ] satisfies BigModelMessage[],
    temperature,
    stream,
  };

  // 创建超时 Promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });

  // 创建 fetch Promise
  const fetchPromise = fetch(BIGMODEL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BIGMODEL_API_KEY}`,
    },
    body: JSON.stringify(body),
  }).then(async (response) => {
    const raw = await response.text();
    console.log("[bigmodel] raw response length:", raw.length);
    if (!response.ok) {
      throw new Error(`BigModel API ${response.status}: ${raw.slice(0, 300)}`);
    }
    const text = parseBigModelResponse(raw);
    if (!text) {
      throw new Error("BigModel API returned empty payload");
    }
    return text;
  });

  // 使用 Promise.race 实现超时
  try {
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    return result;
  } catch (error) {
    if (error instanceof Error && error.message === "Request timeout") {
      console.warn("[bigmodel] Request timed out after", timeoutMs, "ms");
    }
    throw error;
  }
}

function parseBigModelResponse(raw: string): string | null {
  // 非流式响应直接解析 JSON
  try {
    const parsed = JSON.parse(raw);
    const choice = Array.isArray(parsed?.choices) ? parsed.choices[0] : null;
    const directContent = choice ? extractBigModelContent(choice) : "";
    if (directContent.trim()) {
      return directContent.trim();
    }
  } catch {
    // ignore JSON parse errors and fallback to SSE parsing
  }

  // 流式响应解析
  const events = raw
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean);

  let buffer = "";
  for (const event of events) {
    const lines = event.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const jsonText = line.slice(5).trim();
      if (!jsonText || jsonText === "[DONE]") continue;
      try {
        const payload: BigModelResponseChunk = JSON.parse(jsonText);
        const choice = Array.isArray(payload?.choices) ? payload.choices[0] : null;
        if (choice) {
          buffer += extractBigModelContent(choice);
        }
      } catch {
        continue;
      }
    }
  }

  const finalText = buffer.trim();
  return finalText || null;
}

function extractBigModelContent(choice: BigModelResponseChunk["choices"][number]): string {
  const deltaContent = choice?.delta?.content;
  const messageContent = choice?.message?.content;
  const normalizedDelta = normalizeContent(deltaContent);
  if (normalizedDelta.trim()) return normalizedDelta;
  return normalizeContent(messageContent);
}

function normalizeContent(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          const text = (item as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("");
  }
  if (typeof content === "object" && "text" in content) {
    const text = (content as { text?: unknown }).text;
    return typeof text === "string" ? text : "";
  }
  return "";
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
