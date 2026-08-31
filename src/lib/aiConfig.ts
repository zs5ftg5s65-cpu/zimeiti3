import { DEFAULT_AI_CONFIG, type AIConfig } from "./aiService";

export const AI_CONFIG_KEY = "__sm3_ai_config";

export function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_AI_CONFIG;
}

export function saveAIConfig(config: AIConfig) {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}
