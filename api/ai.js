export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "仅支持POST" });
  const apiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "未配置DEEPSEEK_API_KEY，请在部署平台环境变量中配置" });

  try {
    const { prompt, model, images } = req.body || {};
    if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "prompt不能为空" });
    const baseUrl = (process.env.AI_API_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个严谨的餐饮实体店短视频运营助手。只根据用户提供的信息工作，不编造事实。" },
          {
            role: "user",
            content: Array.isArray(images) && images.length > 0
              ? [{ type: "text", text: prompt }, ...images.slice(0, 8).map((url) => ({ type: "image_url", image_url: { url } }))]
              : prompt,
          },
        ],
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "DeepSeek请求失败" });
    return res.status(200).json({ content: data?.choices?.[0]?.message?.content || "", model: data?.model });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "AI服务异常" });
  }
}
