import type { Script, Shot, Topic } from "@/data/selfmedia3-types";
import type { IDailyPlan } from "@/data/selfmedia-daily";

function makeShot(
  shotNumber: number,
  time: string,
  shotSize: string,
  visual: string,
  action: string,
  dialogue: string,
  subtitle: string,
  shootingNote: string,
  editingNote: string,
): Shot {
  return {
    shotNumber,
    time,
    shotSize,
    visual,
    action,
    dialogue,
    subtitle,
    sound: "自然环境声；可配轻节奏BGM",
    shootingNote,
    editingNote,
    isRequired: true,
    status: "未拍",
  };
}

/**
 * 根据“今日任务 + 今日选题”生成可直接执行的完整拍摄脚本。
 * 这是离线确定性生成器；后续接入真实AI时可替换为AI生成，但数据结构保持一致。
 */
export function buildCompleteScriptFromTopic(topic: Topic, dayPlan?: IDailyPlan, now = Date.now()): Omit<Script, "id" | "accountId" | "storeId"> {
  const theme = dayPlan?.dailyTheme || topic.title;
  const goal = dayPlan?.dailyGoal || topic.reason || "完成今日自媒体内容产出";
  const duration = topic.estimatedDuration || "45-60秒";
  const person = topic.recommendedPerson || "老板娘";
  const dish = topic.recommendedDish || "";
  const core = topic.coreOpinion || topic.painPoint || `围绕“${theme}”讲清楚一个具体问题`;
  const structure = topic.structure || "Hook→提出问题→展示真实过程/证据→老板娘观点→给出建议→CTA";
  const cta = topic.cta || "想看更多真实餐饮内容，关注我；有问题可以评论区聊聊。";
  const facts = topic.factsToConfirm ? `需确认：${topic.factsToConfirm}` : "具体价格、时间、经营经历、销量等事实拍摄前再次确认";

  const shots: Shot[] = [
    makeShot(1, "0-3s", "近景", "老板娘面对镜头，手里拿着与主题直接相关的食材/菜品/物件；背景保持真实门店环境", "看镜头，直接说Hook，不寒暄", topic.hook || `今天跟你聊一个和${theme}有关的事`, topic.hook || `今天跟你聊一个和${theme}有关的事`, "手机竖屏，人物占画面主体；不拍客人", "前3秒直接切入，去掉寒暄"),
    makeShot(2, "3-8s", "中近景", "主题对应的问题或场景特写，例如食材、灶台、菜品、门店环境", "边操作边说清楚用户为什么要关心", topic.painPoint ? `很多人真正担心的是：${topic.painPoint}` : "很多人真正关心的，不是表面上看到的这个，而是后面这一步。", topic.painPoint || "把用户痛点打在字幕上", "只拍后厨、食材、菜品和环境，不出现顾客", "用2-3个快切镜头提高节奏"),
    makeShot(3, "8-16s", "特写", "展示真实过程/食材/菜品细节，优先使用当日实际拍摄素材", "手部操作或厨师正常制作，不摆拍客人", `你看，真正要注意的是${core}`, `重点：${core}`, "只展示现场能够证明的内容；没有证据的数字不写", "特写与中景交替，保留真实声音"),
    makeShot(4, "16-25s", "中景+特写", "老板娘继续讲解，同时插入对应过程画面", "边讲边指向画面中的具体细节", `我们自己做的时候，我更看重这一点：${core}`, `老板娘观点：${core}`, "如果涉及个人经历、价格、时间等具体事实，现场确认后再说", "台词完整保留，避免过度剪碎"),
    makeShot(5, "25-34s", "特写", "最能体现主题价值的一个细节：食材、成品、制作步骤或门店环境", "展示细节，必要时做一次近距离对比", "所以如果你也在选，记住一个最简单的判断方法：先看真实情况，再决定。", "先看真实情况，再决定", "不要使用未经确认的“最好/第一/全网”等绝对化表述", "这里作为视频价值点，节奏稍微放慢"),
    makeShot(6, "34-43s", "近景", "老板娘回到镜头前，总结今天的一个核心观点", "看镜头总结，语气像和熟人聊天", `我做这个内容，就是想把店里真实的一面给你看明白。`, "把真实的一面给你看明白", "不要喊口号，不要编造顾客评价或销量", "字幕突出“真实”与核心观点"),
    makeShot(7, "43-52s", "中景/空镜", dish ? `展示${dish}或本条主题对应的成品/环境画面` : "展示本条主题对应的成品、食材或门店环境", "拍成品、环境、手部动作等无顾客画面", dish ? `今天这条就先聊到这，具体${dish}的细节我再慢慢给你讲。` : "今天这条就先聊到这，具体细节我再慢慢给你讲。", "具体细节，后面继续讲", "不得拍到顾客及隐私信息", "作为视觉缓冲，给CTA留空间"),
    makeShot(8, "52-60s", "近景", "老板娘正面收尾，画面干净", "自然收尾，不做夸张动作", cta, cta, "CTA必须与账号真实业务相关；不要承诺不存在的优惠或位置", "最后1-2秒保留CTA字幕，干净结束"),
  ];

  return {
    day: topic.day ?? dayPlan?.day,
    sourceTopicId: topic.id,
    title: topic.title,
    targetUser: topic.targetUser || "30-50岁实体老板、都市蓝领、商务宴请及本地聚餐人群",
    goal,
    person,
    dish,
    estimatedDuration: duration,
    contentType: topic.contentType,
    shots,
    requiredMediaIds: [],
    shootingOrder: "1开场Hook → 2提出痛点 → 3展示真实细节 → 4老板娘观点 → 5价值方法 → 6总结 → 7成品/环境 → 8CTA",
    requiredShots: "1、2、3、4、5、6、7、8全部必拍；若当天素材不足，优先保证1、2、4、6、8。",
    optionalShots: "可根据现场情况补拍食材特写、炖煮过程、门头、包厢、后厨空镜，不拍顾客。",
    missingMaterials: facts,
    status: "草稿",
    createdAt: now,
    updatedAt: now,
  };
}
