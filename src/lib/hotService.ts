import type { HotCaseAnalysis } from "@/data/selfmedia3-types";

export interface HotFetchItem {
  platform: string;
  account: string;
  title: string;
  url: string;
  publishTime: string;
  collectedAt: string;
  data: string;
  verified: boolean;
  sourceType: "web_search" | "platform_api";
  sourceQuery: string;
  relevanceScore?: number;
  hotRank?: number;
  metrics?: string;
  remark?: string;
}

export async function fetchHotCandidates(keywords: string[], date?: string): Promise<{ date: string; items: HotFetchItem[]; note?: string }> {
  const response = await fetch("/api/hot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords, date }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : `热门采集失败（${response.status}）`);
  if (!Array.isArray(data?.items)) throw new Error("热门采集返回格式不正确");
  return data;
}

export function buildHotAnalysisPrompt(hot: { platform: string; account: string; title: string; url: string; data: string }, todayTask: string, accountContext: string) {
  return `你是一位餐饮实体店短视频拆解专家。请分析下面的公开热门视频候选。不能打开链接时，只根据标题、账号、平台、今日任务和账号资料分析，不得假装看过视频。

【平台】${hot.platform}
【账号】${hot.account || "未知"}
【标题】${hot.title}
【链接】${hot.url}
【热度数据】${hot.data || "未提供"}
【今日任务】${todayTask}
【账号资料】${accountContext}

输出JSON对象：
{"summary":"","hook":"","opening":"","structure":"","persona":"","emotion":"","pacing":"","cta":"","highlights":"","weaknesses":"","copyPoints":"","avoidPoints":"","adaptation":"","fitToTodayTask":""}

禁止编造播放量、点赞量、评论量、发布时间和视频画面；明确区分“已知信息”和“推断”。重点回答：这个案例为什么值得参考、哪些结构可以迁移到我的老板娘餐饮账号、怎样改成原创而不是抄袭。`;
}

export function normalizeHotAnalysis(raw: Record<string, unknown>): HotCaseAnalysis {
  const text = (key: string) => String(raw[key] || "");
  return {
    summary: text("summary"), hook: text("hook"), opening: text("opening"), structure: text("structure"),
    persona: text("persona"), emotion: text("emotion"), pacing: text("pacing"), cta: text("cta"),
    highlights: text("highlights"), weaknesses: text("weaknesses"), copyPoints: text("copyPoints"),
    avoidPoints: text("avoidPoints"), adaptation: text("adaptation"), fitToTodayTask: text("fitToTodayTask"), createdAt: Date.now(),
  };
}
