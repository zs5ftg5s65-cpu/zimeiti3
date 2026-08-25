// AI提示词生成器 — 自动带入当前账号、门店、人物资料、故事、模板、拍摄限制
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import { accountName, storeName, type Topic, type Script } from "@/data/selfmedia3-types";

const SHOOTING_RULES = `拍摄限制（必须严格遵守）：
- 不拍客人、不拍客人正脸、不要求顾客出镜
- 不编造顾客评价、不编造销量、不编造排队、不编造价格
- 不编造经营经历、不编造菜品制作时间
- 可以拍：老板娘、厨师、后厨、食材、广德炖锅、其他菜品、门店、环境、制作过程、空镜
- 涉及具体时间、价格、经历等未经确认的事实，必须标注【需要老板娘确认】`;

function contextBlock(store: SelfMediaStore): string {
  const lines: string[] = [];
  lines.push(`当前账号：${accountName(store.currentAccount)}`);
  lines.push(`当前门店：${storeName(store.currentStore)}`);
  lines.push("");

  // 人物资料：当前scope私有 + shared（禁止读取其他账号私人资料）
  const chars = store.getVisibleCharacters();
  if (chars.length > 0) {
    lines.push("【老板娘人物资料】");
    chars.forEach((c) => {
      if (c.name) lines.push(`姓名：${c.name}`);
      if (c.personality) lines.push(`性格：${c.personality}`);
      if (c.speakingStyle) lines.push(`说话方式：${c.speakingStyle}`);
      if (c.catchphrases.length > 0) lines.push(`口头禅：${c.catchphrases.join("、")}`);
      if (c.businessExperience) lines.push(`经营经历：${c.businessExperience}`);
      if (c.startupExperience) lines.push(`创业经历：${c.startupExperience}`);
      if (c.diningView) lines.push(`餐饮观点：${c.diningView}`);
      if (c.ingredientView) lines.push(`选材观点：${c.ingredientView}`);
      if (c.serviceView) lines.push(`服务观点：${c.serviceView}`);
      if (c.priceView) lines.push(`价格观点：${c.priceView}`);
    });
    lines.push("");
  }

  // 真实故事
  const stories = store.stories.filter((s) => s.accountId === store.currentAccount && s.storeId === store.currentStore && s.authenticityConfirmed);
  if (stories.length > 0) {
    lines.push("【已确认真实故事】");
    stories.slice(0, 5).forEach((s) => {
      lines.push(`- 《${s.title}》：${s.process.slice(0, 100)}`);
      if (s.bossView) lines.push(`  观点：${s.bossView}`);
    });
    lines.push("");
  }

  // 成功模板
  const tpls = store.templates.filter((t) => t.accountId === store.currentAccount && t.storeId === store.currentStore);
  if (tpls.length > 0) {
    lines.push("【高表现成功模板】");
    tpls.slice(0, 3).forEach((t) => {
      lines.push(`- 主题：${t.theme}｜类型：${t.contentType}｜Hook：${t.hookStructure}｜CTA：${t.cta}`);
      if (t.successReason) lines.push(`  成功原因：${t.successReason}`);
    });
    lines.push("");
  }

  // 最近选题（避免重复）
  const recentTopics = store.topics
    .filter((t) => t.accountId === store.currentAccount && t.storeId === store.currentStore)
    .slice(0, 5);
  if (recentTopics.length > 0) {
    lines.push("【最近已生成选题（避免重复）】");
    recentTopics.forEach((t) => lines.push(`- ${t.title}（${t.riskLevel}）`));
    lines.push("");
  }

  return lines.join("\n");
}

export function buildTopicPrompt(store: SelfMediaStore): string {
  return `你是一位餐饮实体店短视频运营专家。请为以下账号生成3个短视频选题（稳妥型、测试型、突破型各1个）。

${contextBlock(store)}
${SHOOTING_RULES}

目标客户：30-50岁实体老板、都市蓝领、商务宴请、朋友聚餐、家庭聚餐（江阴及周边）。
核心目标：本地曝光→建立信任→菜品认知→私信→到店→团购→复购→转介绍，不是单纯涨粉。

请为每个选题输出以下字段：
1. 标题
2. 风险档位（稳妥型/测试型/突破型）
3. 目标用户
4. 用户痛点
5. 内容类型（老板娘口播/菜品制作/后厨实拍/日常vlog/食材科普/门店展示/故事讲述/团购推荐/图文笔记）
6. 核心观点
7. 推荐菜品
8. Hook（前3秒钩子）
9. 内容结构
10. CTA（行动号召）
11. 推荐理由
12. 风险
13. 需要确认的事实（如有）
14. 是否涉及客人
15. 预计时长
16. 拍摄难度（简单/中等/较难）

要求：老板娘说话要真实、直爽、口语化，不要AI腔，不要假大空，不要天天喊累，不要虚构励志故事。三个选题不要与最近选题高度重复。`;
}

export function buildScriptPrompt(store: SelfMediaStore, topic?: Topic): string {
  const topicInfo = topic
    ? `来源选题：${topic.title}\n类型：${topic.contentType}\nHook：${topic.hook}\n结构：${topic.structure}\nCTA：${topic.cta}\n推荐菜品：${topic.recommendedDish}\n`
    : "";

  return `你是一位餐饮短视频导演。请根据以下信息生成一份可执行的拍摄脚本（逐镜头拍摄执行表）。

${contextBlock(store)}
${topicInfo}
${SHOOTING_RULES}

要求：
1. 先输出视频标题、目标用户、目标、人物、菜品、预计时长、内容类型
2. 然后逐镜头输出，每个镜头包含：镜头号、时间、景别、画面、人物动作、台词、字幕、声音/BGM、拍摄备注、剪辑备注、是否必拍
3. 最后输出：拍摄顺序、必拍镜头清单、可选镜头、缺失素材清单
4. 台词必须是老板娘口语，像跟邻居聊天，不用书面语，不喊口号
5. 30-60秒短视频，节奏紧凑
6. 涉及未经确认的事实标注【需要老板娘确认】`;
}

export function buildReviewPrompt(store: SelfMediaStore, analyticsData: string): string {
  return `你是一位短视频数据分析师。请根据以下真实数据进行复盘，禁止输出空泛结论。

${contextBlock(store)}
视频数据：
${analyticsData}

${SHOOTING_RULES}

请输出：
1. 开头问题（2秒跳失、5秒留存分析）
2. 留存问题（完播率分析）
3. 选题问题
4. 内容问题
5. 人物问题
6. 转化问题（私信、到店、团购）
7. 【最大问题】（只说一个最关键的）
8. 【证据】（用具体数据支撑）
9. 【下一条必须改变什么】（具体可执行）
10. 【下一条不需要改变什么】（保留有效的部分）

禁止使用"表现很好""继续努力""内容不错"等无行动价值的结论。`;
}

export function buildScriptRegeneratePrompt(store: SelfMediaStore, script: Script, action: string): string {
  return `你是一位餐饮短视频导演。请基于以下已有脚本，执行"${action}"操作。

${contextBlock(store)}
当前脚本标题：${script.title}
当前镜头数：${script.shots.length}
${SHOOTING_RULES}

请输出"${action}"后的完整结果，保持老板娘口语化风格。`;
}

export function copyPrompt(prompt: string, _label: string) {
  navigator.clipboard.writeText(prompt);
}
