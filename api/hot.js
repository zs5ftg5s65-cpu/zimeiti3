/**
 * 联网热门候选服务。
 * 优先使用 Serper（如配置 HOT_SEARCH_API_KEY）；未配置时自动回退到 Bing 公开 RSS 搜索，
 * 不要求用户额外购买搜索 API。所有结果都标记为 web_search，绝不伪造平台热度数据。
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
  { name: "抖音", domains: ["douyin.com"] },
  { name: "小红书", domains: ["xiaohongshu.com"] },
  { name: "视频号", domains: ["channels.weixin.qq.com", "weixin.qq.com"] },
];

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseBingRss(xml) {
  const items = [];
  const blocks = String(xml || "").match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const read = (tag) => {
      const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
      return decodeXml(match?.[1] || "");
    };
    const title = read("title");
    const link = read("link");
    const pubDate = read("pubDate");
    if (title && link) items.push({ title, link, pubDate });
  }
  return items;
}

function isAllowedPlatformUrl(platform, rawUrl) {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
    return platform.domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function looksChinese(title) {
  return /[\u3400-\u9fff]/.test(String(title || ""));
}

function cleanResult(platform, item, query, date, sourceType = "web_search") {
  const title = String(item?.title || item?.name || "").trim();
  const url = String(item?.link || item?.url || "").trim();
  if (!title || !url || !looksChinese(title)) return null;
  return {
    platform,
    account: String(item?.source || item?.author || "").trim(),
    title,
    url,
    publishTime: String(item?.pubDate || date),
    collectedAt: new Date().toISOString().slice(0, 10),
    data: "公开搜索结果未提供可核验平台热度数据",
    verified: false,
    sourceType,
    sourceQuery: query,
    relevanceScore: typeof item?.position === "number" ? Math.max(0, 100 - item.position * 5) : undefined,
    hotRank: typeof item?.position === "number" ? item.position : undefined,
    metrics: "未提供；禁止推测",
    remark: "公开网页搜索候选，热度与发布时间需以原平台页面核验。",
  };
}

async function searchWithSerper(query, apiKey) {
  const endpoint = (process.env.HOT_SEARCH_ENDPOINT || "https://google.serper.dev/search").replace(/\/$/, "");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ q: query, num: 5, hl: "zh-cn", gl: "cn" }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || data?.error || `搜索失败（${response.status}）`);
  return Array.isArray(data?.organic) ? data.organic : Array.isArray(data?.results) ? data.results : [];
}

async function searchWithBingRss(query) {
  const url = `https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
  });
  if (!response.ok) throw new Error(`公开搜索失败（${response.status}）`);
  return parseBingRss(await response.text());
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "仅支持GET/POST" });

  const body = req.method === "POST" ? (req.body || {}) : {};
  const date = String(body.date || yesterdayISO());
  const keywords = Array.isArray(body.keywords) && body.keywords.length
    ? body.keywords.slice(0, 12).map(String)
    : ["餐饮老板娘", "实体店老板", "餐饮经营", "本地生活", "土菜馆", "餐饮创业"];
  const apiKey = process.env.HOT_SEARCH_API_KEY;
  const all = [];
  const errors = [];

  for (const p of PLATFORMS) {
    // 不再使用一个很长的 OR 查询；逐个关键词搜索能显著降低 Bing 把无关英文页面混进来的概率。
    const platformQuery = p.domains.map((domain) => `site:${domain}`).join(" OR ");
    for (const keyword of keywords.slice(0, 4)) {
      const query = `${platformQuery} ${keyword} after:${date} before:${nextDayISO(date)}`;
      try {
        const results = apiKey
          ? await searchWithSerper(query, apiKey)
          : await searchWithBingRss(query);
        results.slice(0, 3).forEach((item, index) => {
          const normalized = apiKey
            ? { ...item, position: typeof item?.position === "number" ? item.position : index + 1 }
            : item;
          const rawUrl = String(normalized?.link || normalized?.url || "").trim();
          // 最关键的防错：搜索引擎即使无视 site: 约束，也不能把国外/其他网站塞进案例库。
          if (!isAllowedPlatformUrl(p, rawUrl)) return;
          const row = cleanResult(p.name, normalized, query, date, "web_search");
          if (row) all.push(row);
        });
      } catch (error) {
        errors.push(`${p.name}：${error instanceof Error ? error.message : "搜索失败"}`);
      }
    }
  }

  const unique = Array.from(new Map(all.map((item) => [item.url, item])).values());
  const note = apiKey
    ? "已限制为抖音/小红书/视频号域名结果；结果不是官方平台热榜，无热度数据时不虚构播放/点赞。"
    : "未配置 HOT_SEARCH_API_KEY，已自动使用公开 Bing RSS 搜索，并严格限制为抖音/小红书/视频号域名；结果不是官方平台热榜，无热度数据时不虚构播放/点赞。";

  return res.status(200).json({
    date,
    collectedAt: new Date().toISOString().slice(0, 10),
    items: unique,
    count: unique.length,
    note,
    warnings: errors.length ? errors : undefined,
  });
}
