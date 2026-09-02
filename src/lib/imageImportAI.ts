import { callAI, extractJSON } from "./aiService";
import { loadAIConfig } from "./aiConfig";

export async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

export async function extractScreenshotJSON<T>(file: File, instruction: string): Promise<T> {
  const image = await fileToDataUrl(file);
  const prompt = `你是数据录入助手。用户上传的是${instruction}的手机截图。只识别截图中真实可见的信息，不确定就返回空字符串或0，禁止猜测。输出严格JSON，不要Markdown。`;
  const result = await callAI(prompt, loadAIConfig(), [image]);
  return extractJSON<T>(result.content);
}
