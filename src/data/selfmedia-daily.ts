// 自媒体运营每日数据 - 广德光英土菜馆/古巷里土菜馆
// 江阴徽菜馆，主营广德炖锅、肉汁香芋煲

// ============ 账号定位 ============
export interface IAccountProfile {
  accountName: string;
  person: string;
  personTraits: string[];
  region: string;
  industry: string;
  coreDishes: string[];
  coreSellingPoints: string[];
  targetCustomers: string[];
  userPainPoints: string[];
  contentDirections: string[];
  businessGoals: string[];
  shootingRestrictions: string[];
  forbiddenContent: string[];
}

export const ACCOUNT_PROFILE: IAccountProfile = {
  accountName: "广德光英土菜馆（江阴店）",
  person: "光英老板娘",
  personTraits: ["直爽真诚", "爱唠嗑", "有烟火气", "实在不玩虚的", "真实经历待补充"],
  region: "江苏江阴",
  industry: "徽菜/土菜馆/砂锅炖锅",
  coreDishes: ["广德炖锅", "肉汁香芋煲（荔浦芋头）", "徽菜家常菜", "砂锅系列"],
  coreSellingPoints: ["食材新鲜每天采购", "老味道老手艺", "量大实惠", "适合聚餐宴请", "老板娘亲自下厨把关"],
  targetCustomers: ["30-50岁实体老板", "都市蓝领", "商务宴请人群", "朋友聚餐", "生意伙伴宴请", "本地老食客"],
  userPainPoints: ["不知道请客去哪有面子又实惠", "怕食材不新鲜", "怕被宰", "想找有特色的本地菜馆", "聚餐环境和口味难兼顾"],
  contentDirections: ["老板娘日常", "招牌菜制作揭秘", "后厨实拍", "食材挑选科普", "餐饮创业故事", "聚餐宴请推荐", "江阴本地美食"],
  businessGoals: ["本地曝光", "建立信任", "到店转化", "私信咨询", "团购核销", "老客复购"],
  shootingRestrictions: ["不拍客人正脸", "不出现客人", "可以拍老板娘", "可以拍厨师", "可以拍后厨", "可以拍食材", "可以拍菜品", "可以拍门店环境"],
  forbiddenContent: ["客人正脸", "顾客隐私信息", "虚假宣传", "贬低同行", "低俗内容", "过度美颜滤镜", "与门店无关的泛娱乐内容"],
};

// ============ 30天计划 ============
export interface IDailyPlan {
  day: number;
  week: number;
  stage: string;
  dailyTheme: string;
  dailyGoal: string;
  topic: string;
  contentType: string;
  shootingTask: string;
  scriptTask: string;
  publishTask: string;
  dataTask: string;
  reviewTask: string;
  mustProduce: string;
  successCriteria: string;
}

const stages = ["起步期（1-7天）：建立人设", "成长期（8-14天）：菜品内容", "爆发期（15-21天）：故事+信任", "稳定期（22-30天）：转化+复购"];
const dailyThemes = [
  "老板娘自我介绍", "门店环境展示", "招牌菜广德炖锅", "食材采购日常", "后厨揭秘", "肉汁香芋煲", "老板娘创业故事",
  "如何挑选好芋头", "炖锅为什么好吃", "后厨的一天", "老客人的故事", "商务宴请推荐", "朋友聚餐套餐", "食材新鲜度展示",
  "老板娘的一天", "做菜的手艺传承", "江阴本地人的口味", "团购套餐介绍", "后厨卫生展示", "节日聚餐推荐", "老板娘唠嗑",
  "菜品分量展示", "厨师团队介绍", "老客复购故事", "私信咨询引导", "到店打卡引导", "团购使用指南", "老板娘感谢粉丝", "月末总结+下月预告", "综合内容复盘",
];

export const THIRTY_DAY_PLAN: IDailyPlan[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const week = Math.ceil(day / 7);
  const stage = stages[Math.min(Math.floor((day - 1) / 7), stages.length - 1)];
  return {
    day,
    week,
    stage,
    dailyTheme: dailyThemes[i] || `第${day}天内容`,
    dailyGoal: day <= 7 ? "让观众认识老板娘和门店" : day <= 14 ? "展示招牌菜和食材品质" : day <= 21 ? "建立信任和情感连接" : "引导到店和复购",
    topic: dailyThemes[i] || `第${day}天选题`,
    contentType: ["老板娘口播", "菜品制作", "后厨实拍", "日常vlog", "图文笔记"][i % 5],
    shootingTask: `拍摄${dailyThemes[i] || "今日主题"}相关素材，时长30-60秒`,
    scriptTask: `完成${dailyThemes[i]}脚本撰写，包含开头钩子和结尾CTA`,
    publishTask: "抖音+视频号发布，小红书同步图文",
    dataTask: "记录播放、点赞、评论、收藏、转发、私信数据",
    reviewTask: "对比昨日数据，分析完播率和互动率",
    mustProduce: "1条短视频+1条图文笔记",
    successCriteria: day <= 7 ? "完成定位、素材和首批内容资产；不以播放量作为唯一判断。" : day <= 14 ? "至少完成一轮发布与数据记录；找出一个值得继续测试的内容结构。" : day <= 21 ? "形成可复用的选题/脚本/镜头结构；根据自然数据淘汰低效方向。" : "完成30天数据复盘；明确下月继续、停止、测试的内容方向，并用真实转化数据判断。",
  };
});

// ============ 选题库 ============
export interface ITopic {
  id: string;
  title: string;
  contentType: string;
  targetCustomer: string;
  painPoint: string;
  hook: string;
  coreContent: string;
  shotSuggestions: string;
  cta: string;
  bossOnCamera: boolean;
  needChef: boolean;
  needDish: boolean;
  needStore: boolean;
  involvesCustomer: boolean;
  priority: "高" | "中" | "低";
}

export const TOPIC_LIBRARY: ITopic[] = [
  {
    id: "T001",
    title: "这锅广德炖锅为什么一直有人点",
    contentType: "菜品制作+老板娘口播",
    targetCustomer: "本地食客+聚餐人群",
    painPoint: "想找有特色的本地菜馆",
    hook: "在江阴，很多人吃炖锅时最关心的其实是食材和做法",
    coreContent: "展示广德炖锅的食材、炖煮过程、成品，老板娘讲这道菜的来历",
    shotSuggestions: "食材特写→炖煮过程→成品冒热气→老板娘端锅出镜",
    cta: "想吃的朋友评论区扣1，我给你留位置",
    bossOnCamera: true,
    needChef: false,
    needDish: true,
    needStore: true,
    involvesCustomer: false,
    priority: "高",
  },
  {
    id: "T002",
    title: "老板娘教你挑荔浦芋头，3招不踩坑",
    contentType: "食材科普+口播",
    targetCustomer: "家庭主妇+美食爱好者",
    painPoint: "买芋头不会挑，经常买到不粉的",
    hook: "买芋头别只看大小！老板娘教你3招挑出粉糯的荔浦芋头",
    coreContent: "展示挑芋头的3个技巧：看形状、摸表皮、掂重量，对比好芋头和差芋头",
    shotSuggestions: "芋头堆特写→老板娘挑选动作→切开对比粉度→成品香芋煲",
    cta: "你们平时怎么挑芋头？评论区聊聊",
    bossOnCamera: true,
    needChef: false,
    needDish: true,
    needStore: false,
    involvesCustomer: false,
    priority: "高",
  },
  {
    id: "T003",
    title: "餐饮老板娘的一天：从备菜到打烊",
    contentType: "日常vlog",
    targetCustomer: "餐饮同行+本地食客",
    painPoint: "对餐饮人的日常好奇",
    hook: "开饭店的一天是怎样的？跟拍老板娘从早到晚",
    coreContent: "记录老板娘一天：早起采购、备菜、午市、休息、晚市、打烊",
    shotSuggestions: "清晨菜市场→后厨备菜→午市忙碌→晚市收尾→打烊锁门",
    cta: "做餐饮不容易，给老板娘点个赞吧",
    bossOnCamera: true,
    needChef: true,
    needDish: true,
    needStore: true,
    involvesCustomer: false,
    priority: "高",
  },
  {
    id: "T004",
    title: "请客吃饭去哪？江阴这家徽菜馆有面子又实惠",
    contentType: "探店推荐+口播",
    targetCustomer: "商务宴请+朋友聚餐",
    painPoint: "请客不知道去哪有面子又不贵",
    hook: "在江阴请客吃饭，这家店既有面子又实惠，老板们都爱来",
    coreContent: "展示门店环境、包厢、招牌菜、人均消费，适合宴请的理由",
    shotSuggestions: "门店门头→包厢环境→菜品上桌→老板娘介绍→价格展示",
    cta: "最近要请客的朋友，私信我给你安排包厢",
    bossOnCamera: true,
    needChef: false,
    needDish: true,
    needStore: true,
    involvesCustomer: false,
    priority: "高",
  },
  {
    id: "T005",
    title: "肉汁香芋煲怎么做？从食材到成品带你看",
    contentType: "菜品制作揭秘",
    targetCustomer: "美食爱好者+潜在顾客",
    painPoint: "想知道招牌菜为什么好吃",
    hook: "这道香芋煲今天具体用了什么食材、做了多久，就按当天真实制作过程来讲",
    coreContent: "完整展示香芋煲的制作过程：芋头处理、肉汁熬制、砂锅慢炖、成品",
    shotSuggestions: "芋头削皮切块→肉汁熬制→砂锅炖煮→成品特写→挖一勺拉丝",
    cta: "想来吃的朋友，左下角团购更划算",
    bossOnCamera: false,
    needChef: true,
    needDish: true,
    needStore: false,
    involvesCustomer: false,
    priority: "高",
  },
  {
    id: "T006",
    title: "做餐饮的理念（待老板娘确认具体表达）",
    contentType: "老板娘口播+价值观",
    targetCustomer: "全受众",
    painPoint: "怕餐馆食材不新鲜",
    hook: "做餐饮这些年，我就认一个理：食材上不能省（具体年限待确认）",
    coreContent: "老板娘讲述做餐饮的理念，展示每天新鲜采购的食材，对比好食材和差食材",
    shotSuggestions: "老板娘面对镜头→新鲜食材特写→后厨处理食材→成品菜",
    cta: "认同的朋友点个赞，你们吃饭最看重什么？",
    bossOnCamera: true,
    needChef: false,
    needDish: true,
    needStore: false,
    involvesCustomer: false,
    priority: "中",
  },
  {
    id: "T007",
    title: "后厨实拍：一顿饭从食材到上桌要多久",
    contentType: "后厨揭秘",
    targetCustomer: "好奇后厨的食客",
    painPoint: "对餐馆后厨卫生和效率好奇",
    hook: "后厨实拍！从点菜到上桌，一道菜要经过多少步骤",
    coreContent: "跟拍一道菜的完整流程：接单→备菜→烹饪→装盘→传菜",
    shotSuggestions: "接单屏幕→厨师备菜→灶台烹饪→装盘→服务员端走",
    cta: "还想看哪道菜的制作过程？评论区告诉我",
    bossOnCamera: false,
    needChef: true,
    needDish: true,
    needStore: true,
    involvesCustomer: false,
    priority: "中",
  },
  {
    id: "T008",
    title: "老客人吃了10年，就认这个味道",
    contentType: "故事+口碑",
    targetCustomer: "潜在顾客+老客",
    painPoint: "想找经得起时间考验的老店",
    hook: "这位客人吃了我们家10年，每次来都点这几道菜",
    coreContent: "讲述老客人的故事（不拍正脸，只拍背影或菜品），展示招牌菜，老板娘讲老客情怀",
    shotSuggestions: "菜品上桌→客人背影（虚化）→老板娘讲述→老菜特写",
    cta: "你有没有吃了很多年的老店？评论区分享",
    bossOnCamera: true,
    needChef: false,
    needDish: true,
    needStore: true,
    involvesCustomer: true,
    priority: "中",
  },
  {
    id: "T009",
    title: "江阴人的口味，咸鲜微辣，浓油赤酱",
    contentType: "本地美食文化+口播",
    targetCustomer: "本地食客+外地游客",
    painPoint: "想了解江阴本地饮食文化",
    hook: "江阴人吃饭什么口味？做了这些年餐饮，总结出这几个特点",
    coreContent: "介绍江阴/徽菜的口味特点，展示代表菜品，讲本地饮食文化",
    shotSuggestions: "老板娘口播→菜品展示→食材特写→本地元素",
    cta: "江阴的朋友，我说得对不对？",
    bossOnCamera: true,
    needChef: false,
    needDish: true,
    needStore: false,
    involvesCustomer: false,
    priority: "中",
  },
  {
    id: "T010",
    title: "4人聚餐套餐，8道菜吃到撑",
    contentType: "团购推荐+菜品展示",
    targetCustomer: "朋友聚餐+家庭聚餐",
    painPoint: "聚餐点菜纠结，想找划算套餐",
    hook: "4个人来吃饭，点这个套餐8道菜，人均不到50吃到撑",
    coreContent: "展示团购套餐包含的菜品，逐一介绍，展示分量和性价比",
    shotSuggestions: "菜品依次上桌→每道菜特写→4人桌全景→价格展示",
    cta: "左下角团购链接，周末聚餐安排起来",
    bossOnCamera: false,
    needChef: false,
    needDish: true,
    needStore: true,
    involvesCustomer: false,
    priority: "高",
  },
];

// ============ 视频脚本 ============
export interface IVideoScript {
  id: string;
  topic: string;
  videoType: string;
  targetDuration: string;
  shots: {
    shotNumber: number;
    duration: string;
    shotType: string;
    visual: string;
    action: string;
    dialogue: string;
    subtitle: string;
    bgm: string;
    transition: string;
    shootingNote: string;
    editingNote: string;
  }[];
  openingHook: string;
  closingCTA: string;
}

export const SAMPLE_SCRIPTS: IVideoScript[] = [
  {
    id: "S001",
    topic: "广德炖锅招牌菜展示",
    videoType: "菜品制作+老板娘口播",
    targetDuration: "45-60秒",
    shots: [
      { shotNumber: 1, duration: "0-3秒", shotType: "特写", visual: "炖锅揭开盖子，热气腾腾", action: "厨师揭开锅盖", dialogue: "（旁白）这锅炖锅为什么一直有人点？今天给你看真实制作过程", subtitle: "广德炖锅｜真实制作过程", bgm: "轻快民谣+滋滋声", transition: "硬切", shootingNote: "用慢动作拍热气，突出食欲感", editingNote: "开头3秒必须有食欲冲击" },
      { shotNumber: 2, duration: "3-8秒", shotType: "中景", visual: "老板娘面对镜头，身后是门店", action: "老板娘微笑打招呼", dialogue: "我是光英，江阴开徽菜馆的老板娘", subtitle: "我是光英，徽菜馆老板娘", bgm: "轻快民谣", transition: "硬切", shootingNote: "自然光，不要过度美颜", editingNote: "字幕大一点，方便中老年观看" },
      { shotNumber: 3, duration: "8-20秒", shotType: "近景+特写", visual: "食材展示：排骨、笋干、豆腐、酱料", action: "逐一展示食材", dialogue: "广德炖锅讲究食材新鲜，排骨每天现买，笋干是老家带来的", subtitle: "新鲜食材+老家笋干", bgm: "轻快民谣+切菜声", transition: "快速切换", shootingNote: "食材要拍得干净有光泽", editingNote: "每个食材1-2秒，节奏快" },
      { shotNumber: 4, duration: "20-35秒", shotType: "特写", visual: "炖煮过程：食材入锅、加汤、小火慢炖", action: "厨师操作", dialogue: "（旁白）具体炖多久，以今天后厨实际制作时间为准", subtitle: "真实制作时间｜以当天为准", bgm: "轻快民谣+咕嘟声", transition: "硬切", shootingNote: "拍咕嘟冒泡的特写", editingNote: "可以加速播放炖煮过程" },
      { shotNumber: 5, duration: "35-45秒", shotType: "特写+中景", visual: "成品炖锅端上桌，老板娘介绍", action: "老板娘端锅上桌", dialogue: "这一锅够3-4个人吃，人均几十块，请客吃饭有面子", subtitle: "3-4人份，人均几十", bgm: "轻快民谣", transition: "硬切", shootingNote: "拍冒热气的瞬间", editingNote: "价格信息用字幕突出" },
      { shotNumber: 6, duration: "45-55秒", shotType: "中景", visual: "老板娘面对镜头", action: "老板娘引导互动", dialogue: "想吃的朋友评论区扣1，我给你留位置！", subtitle: "评论区扣1，留位置！", bgm: "轻快民谣渐弱", transition: "淡出", shootingNote: "微笑，有亲和力", editingNote: "结尾加门店地址和电话" },
    ],
    openingHook: "这锅炖锅为什么一直有人点？看真实食材和制作过程",
    closingCTA: "想吃的朋友评论区扣1，我给你留位置！",
  },
];

// ============ 爆款拆解 ============
export interface IVideoAnalysis {
  id: string;
  platform: string;
  account: string;
  title: string;
  url: string;
  publishDate: string;
  views: string;
  likes: string;
  comments: string;
  favorites: string;
  shares: string;
  newFollowers: string;
  duration: string;
  dropOff2s: string;
  retention5s: string;
  completionRate: string;
  openingStructure: string;
  conflictPoint: string;
  coreMessage: string;
  persona: string;
  shotStructure: string;
  commonComments: string[];
  replicableStructure: string;
  nonReplicable: string;
  verified: boolean;
}

export const SAMPLE_ANALYSES: IVideoAnalysis[] = [
  {
    id: "A001",
    platform: "抖音",
    account: "示例账号（待采集真实数据）",
    title: "待采集：前一天餐饮热门视频",
    url: "待采集",
    publishDate: "待采集",
    views: "待采集",
    likes: "待采集",
    comments: "待采集",
    favorites: "待采集",
    shares: "待采集",
    newFollowers: "待采集",
    duration: "待采集",
    dropOff2s: "待采集",
    retention5s: "待采集",
    completionRate: "待采集",
    openingStructure: "待分析",
    conflictPoint: "待分析",
    coreMessage: "待分析",
    persona: "待分析",
    shotStructure: "待分析",
    commonComments: ["待采集"],
    replicableStructure: "待分析",
    nonReplicable: "待分析",
    verified: false,
  },
];

// ============ 发布记录 ============
export interface IPublishRecord {
  videoId: string;
  publishDate: string;
  publishTime: string;
  platform: string;
  account: string;
  title: string;
  copywriting: string;
  hashtags: string[];
  videoType: string;
  duration: string;
  views: number;
  dropOffRate2s: number;
  retentionRate5s: number;
  completionRate: number;
  likes: number;
  comments: number;
  favorites: number;
  shares: number;
  newFollowers: number;
  privateMessages: number;
  storeVisits: number;
  groupPurchases: number;
  adSpend: number;
  adViews: number;
  adConversions: number;
  dataScreenshot: string;
  reviewConclusion: string;
  nextAction: string;
}

export const EMPTY_PUBLISH_RECORD: IPublishRecord = {
  videoId: "",
  publishDate: "",
  publishTime: "",
  platform: "抖音",
  account: "广德光英土菜馆",
  title: "",
  copywriting: "",
  hashtags: [],
  videoType: "",
  duration: "",
  views: 0,
  dropOffRate2s: 0,
  retentionRate5s: 0,
  completionRate: 0,
  likes: 0,
  comments: 0,
  favorites: 0,
  shares: 0,
  newFollowers: 0,
  privateMessages: 0,
  storeVisits: 0,
  groupPurchases: 0,
  adSpend: 0,
  adViews: 0,
  adConversions: 0,
  dataScreenshot: "",
  reviewConclusion: "",
  nextAction: "",
};

// ============ 数据复盘 ============
export interface IDataReview {
  date: string;
  videoId: string;
  contentType: string;
  views: number;
  dropOff: number;
  retention5s: number;
  completion: number;
  likeRate: number;
  commentRate: number;
  favoriteRate: number;
  shareRate: number;
  followerRate: number;
  pmRate: number;
  storeConversion: number;
  groupConversion: number;
  worthContinuing: boolean;
  biggestProblem: string;
  nextAction: string;
}

// ============ 多账号多门店管理 ============
export type AccountType = "古巷里土菜馆" | "广德光英土菜馆" | "老板娘个人IP";
export type StoreType = "古巷里土菜馆" | "广德光英土菜馆";

export const ACCOUNTS: AccountType[] = ["古巷里土菜馆", "广德光英土菜馆", "老板娘个人IP"];
export const STORES: StoreType[] = ["古巷里土菜馆", "广德光英土菜馆"];

export interface IAccountInfo {
  name: AccountType;
  store: StoreType | "通用";
  platform: string[];
  focus: string;
  description: string;
}

export const ACCOUNT_LIST: IAccountInfo[] = [
  { name: "古巷里土菜馆", store: "古巷里土菜馆", platform: ["抖音", "视频号", "小红书"], focus: "门店曝光+到店转化", description: "古巷里土菜馆官方账号，主打门店环境、菜品展示、团购引流" },
  { name: "广德光英土菜馆", store: "广德光英土菜馆", platform: ["抖音", "视频号", "小红书"], focus: "老板娘IP+菜品揭秘", description: "广德光英土菜馆官方账号，光英老板娘出镜，主打广德炖锅和香芋煲" },
  { name: "老板娘个人IP", store: "通用", platform: ["抖音", "视频号"], focus: "人设打造+餐饮创业", description: "光英老板娘个人账号，主打餐饮创业故事、人生感悟、后厨日常" },
];

// ============ 素材库 ============
export type MaterialType = "老板娘" | "厨师" | "后厨" | "食材" | "广德炖锅" | "其他菜品" | "门店" | "环境" | "经营日常" | "空镜";

export const MATERIAL_TYPES: MaterialType[] = ["老板娘", "厨师", "后厨", "食材", "广德炖锅", "其他菜品", "门店", "环境", "经营日常", "空镜"];

export interface IMaterial {
  id: string;
  shootDate: string;
  type: MaterialType;
  person: string;
  store: StoreType;
  dish: string;
  scene: string;
  fileType: "图片" | "视频";
  duration: string;
  description: string;
  isUsed: boolean;
  usedVideoId: string;
  remark: string;
}

export const SAMPLE_MATERIALS: IMaterial[] = [
  { id: "M001", shootDate: "2026-08-20", type: "广德炖锅", person: "厨师", store: "广德光英土菜馆", dish: "广德炖锅", scene: "后厨灶台", fileType: "视频", duration: "15秒", description: "炖锅揭盖冒热气特写，食欲感强", isUsed: true, usedVideoId: "V001", remark: "演示素材｜开头钩子用" },
  { id: "M002", shootDate: "2026-08-20", type: "老板娘", person: "光英", store: "广德光英土菜馆", dish: "", scene: "门店门口", fileType: "视频", duration: "8秒", description: "老板娘面对镜头打招呼，自然亲切", isUsed: true, usedVideoId: "V001", remark: "演示素材｜引入部分用" },
  { id: "M003", shootDate: "2026-08-21", type: "食材", person: "", store: "广德光英土菜馆", dish: "荔浦芋头", scene: "后厨操作台", fileType: "图片", duration: "", description: "荔浦芋头切块特写，粉糯质感", isUsed: false, usedVideoId: "", remark: "演示素材｜可用于香芋煲视频" },
  { id: "M004", shootDate: "2026-08-21", type: "后厨", person: "厨师", store: "古巷里土菜馆", dish: "", scene: "后厨全景", fileType: "视频", duration: "12秒", description: "后厨忙碌场景，多人协作", isUsed: false, usedVideoId: "", remark: "演示素材｜空镜/转场用" },
  { id: "M005", shootDate: "2026-08-22", type: "门店", person: "", store: "古巷里土菜馆", dish: "", scene: "门头", fileType: "图片", duration: "", description: "古巷里土菜馆门头，傍晚灯光", isUsed: false, usedVideoId: "", remark: "演示素材｜门店展示用" },
];

// ============ 每日自媒体数据导出 ============
export const MOCK_SELFMEDIA_DAILY = {
  accountProfile: ACCOUNT_PROFILE,
  thirtyDayPlan: THIRTY_DAY_PLAN,
  topicLibrary: TOPIC_LIBRARY,
  sampleScripts: SAMPLE_SCRIPTS,
  sampleAnalyses: SAMPLE_ANALYSES,
  emptyPublishRecord: EMPTY_PUBLISH_RECORD,
  accounts: ACCOUNT_LIST,
  materialTypes: MATERIAL_TYPES,
  sampleMaterials: SAMPLE_MATERIALS,
};
