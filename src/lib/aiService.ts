export interface AIConfig {
  endpoint: string;
  model: string;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  endpoint: "/api/ai",
  model: "deepseek-chat",
};

export interface AIResult {
  content: string;
  model?: string;
}

export async function callAI(prompt: string, config: AIConfig = DEFAULT_AI_CONFIG, images: string[] = []): Promise<AIResult> {
  const response = await fetch(config.endpoint || DEFAULT_AI_CONFIG.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.model || DEFAULT_AI_CONFIG.model, prompt, images }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : `AI请求失败（${response.status}）`);
  }
  if (!data?.content || typeof data.content !== "string") {
    throw new Error("AI返回内容为空或格式不正确");
  }
  return { content: data.content, model: data.model };
}

export function extractJSON<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate = fenced || text.trim();
  try { return JSON.parse(candidate) as T; } catch { /* continue */ }

  const first = Math.min(...[candidate.indexOf("{"), candidate.indexOf("[")].filter((n) => n >= 0));
  const last = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
  if (first >= 0 && last > first) return JSON.parse(candidate.slice(first, last + 1)) as T;
  throw new Error("无法解析AI返回的JSON，请重试");
}
