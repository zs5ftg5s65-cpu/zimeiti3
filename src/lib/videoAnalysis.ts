import { callAI, extractJSON } from "./aiService";
import { loadAIConfig } from "./aiConfig";

export interface VideoFrame { dataUrl: string; second: number; }

export async function captureVideoFrames(file: Blob, count = 6): Promise<{ frames: VideoFrame[]; duration: number; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const loaded = new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("无法读取视频信息"));
    });
    video.src = url;
    await loaded;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const width = video.videoWidth;
    const height = video.videoHeight;
    const frames: VideoFrame[] = [];
    const max = Math.max(1, count);
    const times = duration > 0 ? Array.from({ length: max }, (_, i) => Math.min(duration - 0.05, (duration * i) / Math.max(1, max - 1))) : [0];
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 720 / Math.max(width || 720, height || 720));
    canvas.width = Math.max(1, Math.round((width || 720) * scale));
    canvas.height = Math.max(1, Math.round((height || 720) * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("浏览器不支持视频抽帧");
    for (const second of times) {
      await new Promise<void>((resolve, reject) => {
        video.currentTime = Math.max(0, second);
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("视频抽帧失败"));
      });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push({ dataUrl: canvas.toDataURL("image/jpeg", 0.65), second });
    }
    return { frames, duration, width, height };
  } finally { URL.revokeObjectURL(url); }
}

export async function analyzeVideoWithAI(input: {
  name: string; duration: number; transcript: string; frames: VideoFrame[];
}): Promise<Record<string, string | number>> {
  const prompt = `你是短视频拆解专家。请分析用户上传的视频素材。\n视频名称：${input.name}\n视频时长：${input.duration.toFixed(1)}秒\n视频转写/台词（可能为空）：${input.transcript || "未提供"}\n\n请结合视频画面截图和转写，输出严格JSON，不要Markdown。字段：summary,hook,opening3s,opening5s,person,persona,structure,conflict,contrast,emotion,dialogue,shots,pacing,subtitles,cta,highlights,weaknesses,copyPoints,avoidPoints,adaptation。所有字段用中文，不能编造截图或转写中不存在的事实；无法判断时写“无法从当前素材确认”。重点给出可执行的镜头、台词和改造建议。`;
  const result = await callAI(prompt, loadAIConfig(), input.frames.map(f => f.dataUrl));
  return extractJSON<Record<string, string | number>>(result.content);
}
