/**
 * 联网热门候选服务。
 * 默认使用 Serper（Google 搜索结果）作为公开网页检索适配器；
 * 不伪造播放/点赞数据。真正的平台热度数据应接平台官方API后再标记 platform_api。
 * 环境变量：HOT_SEARCH_API_KEY、HOT_SEARCH_ENDPOINT（可选，默认 Serper）。
 */
function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
function nextDayISO(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

const PLATFORMS = [
  { name: "抖音", domain: "douyin.com" },
  { name: "小红书", domain: "xiaohongshu.com" },
  { name: "视频号", domain: "channels.weixin.qq.com" },
];

function cleanResult(platform, item, query, date) {
  const title = String(item?.title || item?.name || "").trim();
  const url = String(item?.link || item?.url || "").trim();
  if (!title || !url) return null;
  return {
    platform,
    account: String(item?.source || item?.author || "").trim(),
    title,
    url,
    publishTime: date,
    collectedAt: new Date().toISOString().slice(0, 10),
    data: "搜索结果未提供可核验平台热度数据",
    verified: false,
    sourceType: "web_search",
    sourceQuery: query,
    relevanceScore: typeof item?.position === "number" ? Math.max(0, 100 - item.position * 5) : undefined,
    hotRank: typeof item?.position === "number" ? item.position : undefined,
    metrics: "未提供；禁止推测",
    remark: "联网搜索候选，热度与发布时间需以原平台页面核验。"
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "仅支持GET/POST" });
  const apiKey = process.env.HOT_SEARCH_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "未配置HOT_SEARCH_API_KEY，暂不能联网采集热门候选" });
  const endpoint = (process.env.HOT_SEARCH_ENDPOINT || "https://google.serper.dev/search").replace(/\/$/, "");
  const body = req.method === "POST" ? (req.body || {}) : {};
  const date = String(body.date || yesterdayISO());
  const keywords = Array.isArray(body.keywords) && body.keywords.length
    ? body.keywords.slice(0, 12).map(String)
    : ["餐饮老板娘", "实体店老板", "餐饮经营", "本地生活", "土菜馆", "餐饮创业"];
  const queryBase = keywords.join(" OR ");
  try {
    const all = [];
    for (const p of PLATFORMS) {
      const query = `site:${p.domain} (${queryBase}) after:${date} before:${nextDayISO(date)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-KEY": apiKey, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ q: query, num: 3, hl: "zh-cn", gl: "cn" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || data?.error || `${p.name}搜索失败（${response.status}）`);
      const results = Array.isArray(data?.organic) ? data.organic : Array.isArray(data?.results) ? data.results : [];
      results.slice(0, 3).forEach((item) => {
        const row = cleanResult(p.name, item, query, date);
        if (row) all.push(row);
      });
    }
    return res.status(200).json({ date, collectedAt: new Date().toISOString().slice(0, 10), items: all, count: all.length, note: "搜索结果不是官方平台热榜；无热度数据时不虚构播放/点赞。" });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "联网采集失败" });
  }
}
