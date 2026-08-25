// 自媒体3.0 数据类型定义
// 所有实体必须包含 accountId / storeId 以支持多账号多门店隔离

export type AccountId = "guxiangli" | "guangdeguangying" | "bosslady";
export type StoreId = "guxiangli" | "guangdeguangying" | "common";

export const ACCOUNT_OPTIONS: { id: AccountId; name: string; store: StoreId }[] = [
  { id: "guxiangli", name: "古巷里土菜馆", store: "guxiangli" },
  { id: "guangdeguangying", name: "广德光英土菜馆", store: "guangdeguangying" },
  { id: "bosslady", name: "老板娘个人IP", store: "common" },
];

export const STORE_OPTIONS: { id: StoreId; name: string }[] = [
  { id: "guxiangli", name: "古巷里土菜馆" },
  { id: "guangdeguangying", name: "广德光英土菜馆" },
  { id: "common", name: "通用（个人IP）" },
];

export function accountName(id: AccountId): string {
  return ACCOUNT_OPTIONS.find((a) => a.id === id)?.name ?? id;
}
export function storeName(id: StoreId): string {
  return STORE_OPTIONS.find((s) => s.id === id)?.name ?? id;
}

// ============ 选题 ============
export type TopicRiskLevel = "稳妥型" | "测试型" | "突破型";
export type ContentType =
  | "老板娘口播"
  | "菜品制作"
  | "后厨实拍"
  | "日常vlog"
  | "食材科普"
  | "门店展示"
  | "故事讲述"
  | "团购推荐"
  | "图文笔记";

export interface Topic {
  id: string;
  accountId: AccountId;
  storeId: StoreId;
  title: string;
  riskLevel: TopicRiskLevel;
  targetUser: string;
  painPoint: string;
  contentType: ContentType;
  coreOpinion: string;
  recommendedStore: string;
  recommendedPerson: string;
  recommendedDish: string;
  hook: string;
  structure: string;
  cta: string;
  reason: string;
  risk: string;
  factsToConfirm: string;
  involvesCustomer: boolean;
  estimatedDuration: string;
  shootingDifficulty: "简单" | "中等" | "较难";
  status: "待采用" | "已采用" | "已生成脚本" | "已发布" | "已放弃";
  createdAt: number;
}

// ============ 老板娘人物库 ============
export type ScopeType = "account" | "store" | "shared";
export interface Character {
  accountId: AccountId;
  storeId: StoreId;
  scopeType: ScopeType; // shared=所有账号可读（老板娘公共资料）; account=当前账号私有; store=当前门店私有
  id: string;
  name: string;
  tags: string[];
  personality: string;
  speakingStyle: string;
  catchphrases: string[];
  commonExpressions: string[];
  businessExperience: string;
  startupExperience: string;
  hometownExperience: string;
  openingExperience: string;
  successExperience: string;
  failureExperience: string;
  diningView: string;
  priceView: string;
  ingredientView: string;
  serviceView: string;
  stories: string;
  publicLevel: "完全公开" | "可公开" | "需确认" | "不公开";
  hasShot: boolean;
  relatedVideoIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ============ 真实故事库 ============
export interface Story {
  id: string;
  accountId: AccountId;
  storeId: StoreId;
  title: string;
  happenedTime: string;
  location: string;
  people: string;
  process: string;
  problem: string;
  solution: string;
  result: string;
  bossView: string;
  shootDirection: string;
  suitableContentType: ContentType;
  hasShot: boolean;
  relatedVideoId: string;
  authenticityConfirmed: boolean;
  remark: string;
  createdAt: number;
}

// ============ 脚本导演 ============
export interface Shot {
  shotNumber: number;
  time: string;
  shotSize: string; // 景别
  visual: string;
  action: string;
  dialogue: string;
  subtitle: string;
  sound: string;
  shootingNote: string;
  editingNote: string;
  isRequired: boolean; // 必拍/可选
  status: "未拍" | "已拍";
}

export interface Script {
  id: string;
  accountId: AccountId;
  storeId: StoreId;
  topicId?: string;
  sourceTopicId?: string; // 来源选题ID（闭环）
  title: string;
  targetUser: string;
  goal: string;
  person: string;
  dish: string;
  estimatedDuration: string;
  contentType: ContentType;
  shots: Shot[];
  requiredMediaIds: string[]; // 关联的素材ID
  shootingOrder: string;
  requiredShots: string;
  optionalShots: string;
  missingMaterials: string;
  status: "草稿" | "已定稿" | "拍摄中" | "已拍摄" | "已发布";
  createdAt: number;
  updatedAt: number;
}

// ============ 素材库 ============
export type MediaType =
  | "老板娘"
  | "厨师"
  | "后厨"
  | "食材"
  | "广德炖锅"
  | "其他菜品"
  | "门店"
  | "环境"
  | "经营日常"
  | "空镜";

export const MEDIA_TYPES: MediaType[] = [
  "老板娘", "厨师", "后厨", "食材", "广德炖锅", "其他菜品", "门店", "环境", "经营日常", "空镜",
];

export interface MediaItem {
  id: string;
  accountId: AccountId;
  storeId: StoreId;
  name: string;
  shootDate: string;
  mediaType: MediaType;
  person: string;
  dish: string;
  scene: string;
  fileType: "图片" | "视频";
  duration: string;
  fileSize: string;
  thumbnail: string; // base64缩略图或空
  tags: string[];
  description: string;
  isUsed: boolean;
  usedVideoId: string;
  remark: string;
  createdAt: number;
}

// ============ 发布管理 ============
export type PublishStatus = "待发布" | "已发布" | "已删除" | "复用中";
export type Platform = "抖音" | "视频号" | "小红书";

export interface PublishRecord {
  id: string;
  accountId: AccountId;
  storeId: StoreId;
  scriptId?: string;
  videoId?: string; // 视频唯一ID（贯穿发布→数据→复盘→模板）
  title: string;
  platform: Platform;
  publishDate: string;
  publishTime: string;
  videoType: ContentType;
  duration: string;
  copywriting: string;
  hashtags: string[];
  cta: string;
  status: PublishStatus;
  createdAt: number;
}

// ============ 数据诊断 ============
export interface VideoAnalytics {
  id: string;
  publishId: string;
  videoId?: string; // 关联视频ID（闭环：与PublishRecord.videoId对应）
  title?: string;
  accountId: AccountId;
  storeId: StoreId;
  publishTime: string;
  views: number;
  dropOff2s: number; // 2秒跳失率 %
  retention5s: number; // 5秒留存率 %
  completionRate: number; // 完播率 %
  likes: number;
  comments: number;
  favorites: number;
  shares: number;
  newFollowers: number;
  privateMessages: number;
  storeVisits: number; // 到店
  groupPurchases: number; // 团购
  adSpend: number; // 投流金额
  adViews: number; // 投流后播放
  adConversions: number; // 投流后转化
  recordedAt: number;
}

// 计算后的指标
export interface ComputedMetrics {
  likeRate: number; // 点赞率 = likes/views
  commentRate: number;
  favoriteRate: number;
  shareRate: number;
  followerRate: number;
  pmRate: number;
  storeVisitRate: number; // 到店率
  groupPurchaseRate: number; // 团购率
  adROI: number; // 投流ROI = (adConversions * 假设客单价) / adSpend，无客单价时返回null
}

export function computeMetrics(a: VideoAnalytics): ComputedMetrics {
  const v = a.views || 1;
  return {
    likeRate: (a.likes / v) * 100,
    commentRate: (a.comments / v) * 100,
    favoriteRate: (a.favorites / v) * 100,
    shareRate: (a.shares / v) * 100,
    followerRate: (a.newFollowers / v) * 100,
    pmRate: (a.privateMessages / v) * 100,
    storeVisitRate: (a.storeVisits / v) * 100,
    groupPurchaseRate: (a.groupPurchases / v) * 100,
    adROI: a.adSpend > 0 ? (a.adConversions / a.adSpend) : 0,
  };
}

// ============ AI复盘 ============
export interface Review {
  id: string;
  videoId?: string; // 关联视频ID（闭环）
  analyticsId: string;
  accountId: AccountId;
  storeId: StoreId;
  openingProblem: string;
  retentionProblem: string;
  topicProblem: string;
  contentProblem: string;
  personProblem: string;
  conversionProblem: string;
  biggestProblem: string;
  evidence: string;
  mustChange: string;
  keepUnchanged: string;
  isHighPerforming?: boolean; // 是否高表现（用于保存模板）
  createdAt: number;
  isManual: boolean; // true=手动录入，false=AI生成（当前无AI，均为手动）
}

// ============ 投流判断 ============
export interface AdDecision {
  id: string;
  analyticsId: string;
  accountId: AccountId;
  storeId: StoreId;
  naturalValidation: string; // 自然验证结论
  smallBudgetTest: string; // 小额测试建议
  beforeAfterCompare: string; // 投流前后比较
  decision: "继续投流" | "停止投流" | "观望" | "数据不足";
  reason: string;
  createdAt: number;
}

// ============ 内容实验室 ============
export interface LabExperiment {
  id: string;
  accountId: AccountId;
  storeId: StoreId;
  theme: string;
  variants: LabVariant[];
  bestHook: string;
  worstHook: string;
  recommendedStructure: string;
  createdAt: number;
}

export interface LabVariant {
  version: "A" | "B" | "C";
  hook: string;
  views: number;
  dropOff2s: number;
  retention5s: number;
  completionRate: number;
  likes: number;
  favorites: number;
  shares: number;
  newFollowers: number;
  privateMessages: number;
  storeVisits: number;
  groupPurchases: number;
}

// ============ 成功模板库 ============
export interface WinningTemplate {
  id: string;
  accountId: AccountId;
  storeId: StoreId;
  sourceVideoId: string;
  sourceReviewId?: string; // 来源复盘ID（闭环）
  theme: string;
  contentType: ContentType;
  hookStructure: string;
  shotStructure: string;
  person: string;
  duration: string;
  cta: string;
  realData: string;
  successReason: string;
  createdAt: number;
}

// ============ 热门案例库（手动添加，非实时） ============
export interface HotCase {
  accountId: AccountId;
  storeId: StoreId;
  id: string;
  platform: string;
  account: string;
  title: string;
  url: string;
  publishTime: string;
  collectedAt: string;
  data: string;
  verified: boolean; // 核验状态
  remark: string;
}

// ============ 今日作战台状态（按账号+门店+Day隔离） ============
export interface WarRoomTasks {
  topic: boolean;
  script: boolean;
  shoot: boolean;
  publish: boolean;
  data: boolean;
  review: boolean;
}
export const EMPTY_WAR_ROOM_TASKS: WarRoomTasks = {
  topic: false, script: false, shoot: false, publish: false, data: false, review: false,
};
// key: `${accountId}_${storeId}_${day}`
export type WarRoomByScope = Record<string, WarRoomTasks>;

export function warRoomKey(accountId: AccountId, storeId: StoreId, day: number): string {
  return `${accountId}_${storeId}_${day}`;
}

// 判断人物资料在指定scope下是否可见
export function isCharacterVisible(
  c: { scopeType: ScopeType; accountId: AccountId; storeId: StoreId },
  accountId: AccountId,
  storeId: StoreId,
): boolean {
  if (c.scopeType === "shared") return true;
  if (c.scopeType === "account") return c.accountId === accountId;
  // store
  return c.accountId === accountId && c.storeId === storeId;
}
