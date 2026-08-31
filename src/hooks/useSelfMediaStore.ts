import { useState, useEffect, useCallback, useRef } from "react";
import { scopedStorage } from "@/lib/storage";
import { toast } from "sonner";
import type {
  Topic, Character, Story, Script, MediaItem, PublishRecord,
  VideoAnalytics, VideoAnalysis, Review, AdDecision, LabExperiment, WinningTemplate, HotCase,
  AccountId, StoreId, WarRoomByScope, WarRoomTasks, ScopeType,
} from "@/data/selfmedia3-types";
import { EMPTY_WAR_ROOM_TASKS, warRoomKey, isCharacterVisible } from "@/data/selfmedia3-types";
import { THIRTY_DAY_PLAN } from "@/data/selfmedia-daily";
import { buildCompleteScriptFromTopic } from "@/components/panels/selfmedia3/scriptGenerator";

// 所有自媒体3.0数据的存储key前缀
const KEY_PREFIX = "__sm3_";
const KEYS = {
  topics: KEY_PREFIX + "topics",
  characters: KEY_PREFIX + "characters",
  stories: KEY_PREFIX + "stories",
  scripts: KEY_PREFIX + "scripts",
  media: KEY_PREFIX + "media",
  publishes: KEY_PREFIX + "publishes",
  analytics: KEY_PREFIX + "analytics",
  reviews: KEY_PREFIX + "reviews",
  adDecisions: KEY_PREFIX + "ad_decisions",
  experiments: KEY_PREFIX + "experiments",
  templates: KEY_PREFIX + "templates",
  hotCases: KEY_PREFIX + "hot_cases",
  warRoom: KEY_PREFIX + "war_room_by_scope",
  account: KEY_PREFIX + "account",
  store: KEY_PREFIX + "store",
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = scopedStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}
function save<T>(key: string, value: T): boolean {
  try {
    scopedStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("[storage] 保存失败:", e);
    toast.error("本地存储空间不足，请删除部分素材或导出数据后清理重试");
    return false;
  }
}
export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// 默认老板娘人物资料 — shared 空白模板，不含任何未经确认的事实
const DEFAULT_CHARACTER: Character = {
  scopeType: "shared",
  accountId: "bosslady" as AccountId,
  storeId: "common" as StoreId,
  id: "char_bosslady_default",
  name: "老板娘",
  tags: [],
  personality: "",
  speakingStyle: "",
  catchphrases: [],
  commonExpressions: [],
  businessExperience: "",
  startupExperience: "",
  hometownExperience: "",
  openingExperience: "",
  successExperience: "",
  failureExperience: "",
  diningView: "",
  priceView: "",
  ingredientView: "",
  serviceView: "",
  stories: "",
  publicLevel: "需确认",
  hasShot: false,
  relatedVideoIds: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export interface ExportData {
  version: string;
  exportedAt: number;
  scope?: "all" | "account" | "store";
  data: Record<string, unknown>;
}

export interface ImportPreview {
  valid: boolean;
  version: string;
  totalCounts: Record<string, number>;
  importCounts: Record<string, number>;
  skippedCounts: Record<string, number>;
  invalidCounts: Record<string, number>;
  sharedCounts: Record<string, number>;
  currentAccount: AccountId;
  currentStore: StoreId;
  hasOtherScopeData: boolean;
  hasInvalidData: boolean;
  message: string;
}

// 需要scope校验的实体列表（除characters外，characters有shared逻辑）
const SCOPED_ENTITIES: { key: string; validate: (_it: Record<string, unknown>) => boolean }[] = [
  { key: "topics", validate: () => true },
  { key: "stories", validate: () => true },
  { key: "scripts", validate: () => true },
  { key: "media", validate: () => true },
  { key: "videoAnalyses", validate: () => true },
  { key: "publishes", validate: () => true },
  { key: "analytics", validate: () => true },
  { key: "reviews", validate: () => true },
  { key: "adDecisions", validate: () => true },
  { key: "experiments", validate: () => true },
  { key: "templates", validate: () => true },
  { key: "hotCases", validate: () => true },
];

export function useSelfMediaStore() {
  const [topics, setTopics] = useState<Topic[]>(() => load(KEYS.topics, []));
  const [characters, setCharacters] = useState<Character[]>(() => {
    const existing = load<Character[]>(KEYS.characters, []);
    // 迁移：给旧数据补 scopeType
    const migrated = existing.map((c) => ({
      ...c,
      scopeType: (c.scopeType || (c.accountId === "bosslady" && c.storeId === "common" ? "shared" : "account")) as ScopeType,
    }));
    if (migrated.length === 0) return [DEFAULT_CHARACTER];
    // 确保默认shared老板娘存在
    if (!migrated.some((c) => c.id === "char_bosslady_default")) {
      return [DEFAULT_CHARACTER, ...migrated];
    }
    return migrated;
  });
  const [stories, setStories] = useState<Story[]>(() => load(KEYS.stories, []));
  const [scripts, setScripts] = useState<Script[]>(() => load(KEYS.scripts, []));
  const [media, setMedia] = useState<MediaItem[]>(() => load(KEYS.media, []));
  const [videoAnalyses, setVideoAnalyses] = useState<VideoAnalysis[]>(() => load("__sm3_video_analyses", []));
  const [publishes, setPublishes] = useState<PublishRecord[]>(() => load(KEYS.publishes, []));
  const [analytics, setAnalytics] = useState<VideoAnalytics[]>(() => load(KEYS.analytics, []));
  const [reviews, setReviews] = useState<Review[]>(() => load(KEYS.reviews, []));
  const [adDecisions, setAdDecisions] = useState<AdDecision[]>(() => load(KEYS.adDecisions, []));
  const [experiments, setLabExperiments] = useState<LabExperiment[]>(() => load(KEYS.experiments, []));
  const [templates, setTemplates] = useState<WinningTemplate[]>(() => load(KEYS.templates, []));
  const [hotCases, setHotCases] = useState<HotCase[]>(() => load(KEYS.hotCases, []));
  const [warRoomByScope, setWarRoomByScope] = useState<WarRoomByScope>(() => load(KEYS.warRoom, {}));
  const [currentAccount, setCurrentAccountState] = useState<AccountId>(() => {
    const v = load<string | null>(KEYS.account, null);
    return (v as AccountId) || "guangdeguangying";
  });
  const [currentStore, setCurrentStoreState] = useState<StoreId>(() => {
    const v = load<string | null>(KEYS.store, null);
    return (v as StoreId) || "guangdeguangying";
  });

  const hydrated = useRef(false);
  useEffect(() => { if (hydrated.current) save(KEYS.topics, topics); else hydrated.current = true; }, [topics]);
  useEffect(() => { save(KEYS.characters, characters); }, [characters]);
  useEffect(() => { save(KEYS.stories, stories); }, [stories]);
  useEffect(() => { save(KEYS.scripts, scripts); }, [scripts]);
  useEffect(() => { save(KEYS.media, media); }, [media]);
  useEffect(() => { save("__sm3_video_analyses", videoAnalyses); }, [videoAnalyses]);
  useEffect(() => { save(KEYS.publishes, publishes); }, [publishes]);
  useEffect(() => { save(KEYS.analytics, analytics); }, [analytics]);
  useEffect(() => { save(KEYS.reviews, reviews); }, [reviews]);
  useEffect(() => { save(KEYS.adDecisions, adDecisions); }, [adDecisions]);
  useEffect(() => { save(KEYS.experiments, experiments); }, [experiments]);
  useEffect(() => { save(KEYS.templates, templates); }, [templates]);
  useEffect(() => { save(KEYS.hotCases, hotCases); }, [hotCases]);
  useEffect(() => { save(KEYS.warRoom, warRoomByScope); }, [warRoomByScope]);
  useEffect(() => { save(KEYS.account, currentAccount); }, [currentAccount]);
  useEffect(() => { save(KEYS.store, currentStore); }, [currentStore]);

  const setCurrentAccount = useCallback((acc: AccountId) => {
    setCurrentAccountState(acc);
    if (acc === "bosslady") setCurrentStoreState("common");
    else setCurrentStoreState(acc);
  }, []);
  const setCurrentStore = useCallback((s: StoreId) => setCurrentStoreState(s), []);

  // ============ scope 安全的 CRUD ============
  const addScoped = useCallback(<T extends { id: string; accountId: AccountId; storeId: StoreId }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    item: Omit<T, "id" | "accountId" | "storeId"> & { id?: string },
  ): T => {
    const newItem = {
      ...item,
      id: item.id || uid("item"),
      accountId: currentAccount,
      storeId: currentStore,
    } as T;
    setter((prev) => [newItem, ...prev]);
    return newItem;
  }, [currentAccount, currentStore]);

  const updateScoped = useCallback(<T extends { id: string; accountId: AccountId; storeId: StoreId }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
    patch: Partial<T>,
  ) => {
    setter((prev) => prev.map((it) => {
      if (it.id !== id) return it;
      if (it.accountId !== currentAccount || it.storeId !== currentStore) {
        toast.error("无权修改其他账号/门店的数据");
        return it;
      }
      return { ...it, ...patch };
    }));
  }, [currentAccount, currentStore]);

  const removeScoped = useCallback(<T extends { id: string; accountId: AccountId; storeId: StoreId }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
  ) => {
    setter((prev) => prev.filter((it) => {
      if (it.id !== id) return true;
      if (it.accountId !== currentAccount || it.storeId !== currentStore) {
        toast.error("无权删除其他账号/门店的数据");
        return true;
      }
      return false;
    }));
  }, [currentAccount, currentStore]);

  const filterByCurrent = useCallback(<T extends { accountId: AccountId; storeId: StoreId }>(list: T[]) => {
    return list.filter((it) => it.accountId === currentAccount && it.storeId === currentStore);
  }, [currentAccount, currentStore]);

  // ============ 今日选题 → 完整脚本（统一闭环入口） ============
  const createScriptFromTopic = useCallback((topicId: string, dayOverride?: number): Script | null => {
    const topic = topics.find((t) =>
      t.id === topicId &&
      t.accountId === currentAccount &&
      t.storeId === currentStore
    );
    if (!topic) {
      toast.error("未找到当前账号/门店下的选题");
      return null;
    }

    const targetDay = dayOverride ?? topic.day;
    const existing = scripts.find((s) =>
      s.sourceTopicId === topic.id &&
      s.accountId === currentAccount &&
      s.storeId === currentStore &&
      (targetDay == null || s.day === targetDay)
    );
    if (existing) {
      if (topic.status !== "已生成脚本") updateScoped(setTopics, topic.id, { status: "已生成脚本" });
      return existing;
    }

    const dayPlan = targetDay ? THIRTY_DAY_PLAN.find((d) => d.day === targetDay) : undefined;
    const payload = buildCompleteScriptFromTopic(
      targetDay != null && topic.day !== targetDay ? { ...topic, day: targetDay } : topic,
      dayPlan,
    );
    const created = addScoped(setScripts, payload);
    updateScoped(setTopics, topic.id, { status: "已生成脚本" });
    return created;
  }, [topics, scripts, currentAccount, currentStore, addScoped, updateScoped]);

  // ============ 人物库特殊处理（支持 shared） ============
  // 获取当前scope可见的人物：当前scope私有 + shared
  const getVisibleCharacters = useCallback((): Character[] => {
    return characters.filter((c) => isCharacterVisible(c, currentAccount, currentStore));
  }, [characters, currentAccount, currentStore]);

  const addCharacter = useCallback((c: Omit<Character, "id" | "accountId" | "storeId"> & { scopeType?: ScopeType; accountId?: AccountId; storeId?: StoreId }) => {
    const scopeType = c.scopeType || "account";
    const newChar: Character = {
      ...c,
      id: uid("char"),
      scopeType,
      accountId: scopeType === "shared" ? ("bosslady" as AccountId) : currentAccount,
      storeId: scopeType === "shared" ? ("common" as StoreId) : currentStore,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Character;
    setCharacters((prev) => [newChar, ...prev]);
    return newChar;
  }, [currentAccount, currentStore]);

  const updateCharacter = useCallback((id: string, patch: Partial<Character>) => {
    setCharacters((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      // shared 人物仅老板娘个人IP账号可编辑；私有人物只有owner可编辑
      if (c.scopeType === "shared") {
        if (currentAccount !== "bosslady") {
          toast.error("公共人物资料仅老板娘账号可编辑");
          return c;
        }
      } else if (c.accountId !== currentAccount || c.storeId !== currentStore) {
        toast.error("无权修改其他账号/门店的人物资料");
        return c;
      }
      // 创建后 scopeType/accountId/storeId 锁定，禁止通过普通编辑修改
      const { scopeType: _st, accountId: _ai, storeId: _si, ...contentPatch } = patch;
      return { ...c, ...contentPatch, updatedAt: Date.now() };
    }));
  }, [currentAccount, currentStore]);

  const removeCharacter = useCallback((id: string) => {
    setCharacters((prev) => prev.filter((c) => {
      if (c.id !== id) return true;
      if (c.id === "char_bosslady_default") {
        toast.error("默认老板娘资料不可删除");
        return true;
      }
      if (c.scopeType === "shared") {
        if (currentAccount !== "bosslady") {
          toast.error("公共人物资料仅老板娘账号可删除");
          return true;
        }
      } else if (c.accountId !== currentAccount || c.storeId !== currentStore) {
        toast.error("无权删除其他账号/门店的人物资料");
        return true;
      }
      return false;
    }));
  }, [currentAccount, currentStore]);

  // ============ WarRoom ============
  const getWarRoomTasks = useCallback((day: number): WarRoomTasks => {
    const key = warRoomKey(currentAccount, currentStore, day);
    return warRoomByScope[key] || { ...EMPTY_WAR_ROOM_TASKS };
  }, [warRoomByScope, currentAccount, currentStore]);

  const toggleWarRoomTask = useCallback((day: number, taskKey: keyof WarRoomTasks) => {
    const key = warRoomKey(currentAccount, currentStore, day);
    setWarRoomByScope((prev) => {
      const current = prev[key] || { ...EMPTY_WAR_ROOM_TASKS };
      return { ...prev, [key]: { ...current, [taskKey]: !current[taskKey] } };
    });
  }, [currentAccount, currentStore]);

  const setWarRoomTask = useCallback((day: number, taskKey: keyof WarRoomTasks, value: boolean) => {
    const key = warRoomKey(currentAccount, currentStore, day);
    setWarRoomByScope((prev) => {
      const current = prev[key] || { ...EMPTY_WAR_ROOM_TASKS };
      if (current[taskKey] === value) return prev;
      return { ...prev, [key]: { ...current, [taskKey]: value } };
    });
  }, [currentAccount, currentStore]);

  // ============ 数据导出（支持 scope 过滤） ============
  const exportData = useCallback((scope: "all" | "account" | "store" = "all"): ExportData => {
    const filterScope = <T extends { accountId: AccountId; storeId: StoreId }>(list: T[]): T[] => {
      if (scope === "all") return list;
      if (scope === "account") return list.filter((it) => it.accountId === currentAccount);
      return list.filter((it) => it.accountId === currentAccount && it.storeId === currentStore);
    };
    const data: Record<string, unknown> = {};
    data.topics = filterScope(topics);
    data.characters = scope === "all"
      ? characters
      : characters.filter((c) => c.scopeType === "shared" || (scope === "account" ? c.accountId === currentAccount : c.accountId === currentAccount && c.storeId === currentStore));
    data.stories = filterScope(stories);
    data.scripts = filterScope(scripts);
    data.media = filterScope(media);
    data.videoAnalyses = filterScope(videoAnalyses);
    data.publishes = filterScope(publishes);
    data.analytics = filterScope(analytics);
    data.reviews = filterScope(reviews);
    data.adDecisions = filterScope(adDecisions);
    data.experiments = filterScope(experiments);
    data.templates = filterScope(templates);
    data.hotCases = filterScope(hotCases);
    if (scope === "all") {
      data.warRoomByScope = warRoomByScope;
    } else {
      const filtered: WarRoomByScope = {};
      Object.entries(warRoomByScope).forEach(([k, v]) => {
        const [acc, sto] = k.split("_");
        if (scope === "account" && acc === currentAccount) filtered[k] = v;
        if (scope === "store" && acc === currentAccount && sto === currentStore) filtered[k] = v;
      });
      data.warRoomByScope = filtered;
    }
    return { version: "3.0", exportedAt: Date.now(), scope, data };
  }, [topics, characters, stories, scripts, media, videoAnalyses, publishes, analytics, reviews, adDecisions, experiments, templates, hotCases, warRoomByScope, currentAccount, currentStore]);

  // ============ 导入预览（不写入，只统计） ============
  const previewImport = useCallback((imported: ExportData): ImportPreview => {
    const empty: ImportPreview = {
      valid: false, version: "", totalCounts: {}, importCounts: {}, skippedCounts: {},
      invalidCounts: {}, sharedCounts: {}, currentAccount, currentStore,
      hasOtherScopeData: false, hasInvalidData: false, message: "",
    };
    if (!imported || !imported.data || typeof imported.data !== "object") {
      return { ...empty, message: "文件格式无效：缺少data字段" };
    }
    // 严格版本校验：只接受 3.0
    if (imported.version !== "3.0") {
      return { ...empty, version: String(imported.version || ""), message: `版本不兼容：需要 3.0，当前文件为 ${imported.version || "未知"}` };
    }
    const d = imported.data;
    const totalCounts: Record<string, number> = {};
    const importCounts: Record<string, number> = {};
    const skippedCounts: Record<string, number> = {};
    const invalidCounts: Record<string, number> = {};
    const sharedCounts: Record<string, number> = {};
    let hasOtherScopeData = false;
    let hasInvalidData = false;
    // 必要字段校验
    const hasRequiredFields = (it: unknown): boolean => {
      if (!it || typeof it !== "object") return false;
      const o = it as Record<string, unknown>;
      return typeof o.id === "string" && o.id.length > 0
        && typeof o.accountId === "string" && o.accountId.length > 0
        && typeof o.storeId === "string" && o.storeId.length > 0;
    };
    // characters 特殊处理（shared 不需要匹配当前 scope，但仍需 id）
    const charArr = Array.isArray(d.characters) ? (d.characters as Character[]) : [];
    totalCounts.characters = charArr.length;
    let charImport = 0, charSkip = 0, charShared = 0, charInvalid = 0;
    charArr.forEach((c) => {
      if (!c || typeof c !== "object" || !c.id) { charInvalid++; hasInvalidData = true; return; }
      const st = (c.scopeType || (c.accountId === "bosslady" && c.storeId === "common" ? "shared" : "account")) as ScopeType;
      if (st === "shared") { charImport++; charShared++; }
      else if (c.accountId === currentAccount && c.storeId === currentStore) { charImport++; }
      else { charSkip++; hasOtherScopeData = true; }
    });
    importCounts.characters = charImport;
    skippedCounts.characters = charSkip;
    invalidCounts.characters = charInvalid;
    sharedCounts.characters = charShared;
    // 其他实体：校验必要字段 + scope
    SCOPED_ENTITIES.forEach(({ key }) => {
      const arr = Array.isArray(d[key]) ? (d[key] as Array<Record<string, unknown>>) : [];
      totalCounts[key] = arr.length;
      let imp = 0, skip = 0, inv = 0;
      arr.forEach((it) => {
        if (!hasRequiredFields(it)) { inv++; hasInvalidData = true; return; }
        if (it.accountId === currentAccount && it.storeId === currentStore) imp++;
        else { skip++; hasOtherScopeData = true; }
      });
      importCounts[key] = imp;
      skippedCounts[key] = skip;
      invalidCounts[key] = inv;
    });
    // warRoom
    const wr = d.warRoomByScope;
    if (wr && typeof wr === "object") {
      const keys = Object.keys(wr);
      totalCounts.warRoomByScope = keys.length;
      let imp = 0, skip = 0;
      keys.forEach((k) => {
        const parts = k.split("_");
        if (parts.length >= 3 && parts[0] === currentAccount && parts[1] === currentStore) imp++;
        else { skip++; hasOtherScopeData = true; }
      });
      importCounts.warRoomByScope = imp;
      skippedCounts.warRoomByScope = skip;
      invalidCounts.warRoomByScope = 0;
    }
    const totalSkip = Object.values(skippedCounts).reduce((a, b) => a + b, 0);
    const totalInvalid = Object.values(invalidCounts).reduce((a, b) => a + b, 0);
    const msgs: string[] = [];
    if (hasOtherScopeData) msgs.push(`其他账号/门店数据 ${totalSkip} 条，已自动跳过`);
    if (hasInvalidData) msgs.push(`无效数据 ${totalInvalid} 条（缺少id/accountId/storeId），已跳过`);
    if (msgs.length === 0) msgs.push("所有数据均属于当前账号/门店");
    return {
      valid: true, version: imported.version, totalCounts, importCounts, skippedCounts,
      invalidCounts, sharedCounts, currentAccount, currentStore,
      hasOtherScopeData, hasInvalidData, message: msgs.join("；") + "。",
    };
  }, [currentAccount, currentStore]);
  // ============ 导入（scope 校验 + 合并而非覆盖） ============
  const importData = useCallback((imported: ExportData): { success: boolean; message: string } => {
    try {
      const preview = previewImport(imported);
      if (!preview.valid) return { success: false, message: preview.message };
      const d = imported.data;

      // 合并函数：按id去重，导入数据优先
      const mergeById = <T extends { id: string }>(existing: T[], incoming: T[]): T[] => {
        const map = new Map(existing.map((it) => [it.id, it]));
        incoming.forEach((it) => map.set(it.id, it));
        return Array.from(map.values());
      };

      // characters: 只导入 shared + 当前scope
      if (Array.isArray(d.characters)) {
        const allowed = (d.characters as Character[]).filter((c) => {
          if (!c || !c.id) return false;
          const st = (c.scopeType || (c.accountId === "bosslady" && c.storeId === "common" ? "shared" : "account")) as ScopeType;
          return st === "shared" || (c.accountId === currentAccount && c.storeId === currentStore);
        }).map((c) => ({
          ...c,
          scopeType: (c.scopeType || (c.accountId === "bosslady" && c.storeId === "common" ? "shared" : "account")) as ScopeType,
        }));
        setCharacters((prev) => mergeById(prev, allowed));
      }

      // 其他实体：只导入当前scope
      SCOPED_ENTITIES.forEach(({ key }) => {
        const arr = d[key];
        if (!Array.isArray(arr)) return;
        const allowed = (arr as Array<{ id: string; accountId: AccountId; storeId: StoreId }>).filter(
          (it) => it && it.id && it.accountId === currentAccount && it.storeId === currentStore,
        );
        const setterMap: Record<string, React.Dispatch<React.SetStateAction<any[]>>> = {
          topics: setTopics, stories: setStories, scripts: setScripts, media: setMedia, videoAnalyses: setVideoAnalyses,
          publishes: setPublishes, analytics: setAnalytics, reviews: setReviews,
          adDecisions: setAdDecisions, experiments: setLabExperiments, templates: setTemplates, hotCases: setHotCases,
        };
        const setter = setterMap[key];
        if (setter) setter((prev: any[]) => mergeById(prev, allowed as any[]));
      });

      // warRoom: 只导入当前scope的key
      if (d.warRoomByScope && typeof d.warRoomByScope === "object") {
        const wr = d.warRoomByScope as WarRoomByScope;
        setWarRoomByScope((prev) => {
          const next = { ...prev };
          Object.entries(wr).forEach(([k, v]) => {
            const [acc, sto] = k.split("_");
            if (acc === currentAccount && sto === currentStore) next[k] = v;
          });
          return next;
        });
      }

      const totalImport = Object.values(preview.importCounts).reduce((a, b) => a + b, 0);
      const totalSkip = Object.values(preview.skippedCounts).reduce((a, b) => a + b, 0);
      return {
        success: true,
        message: `导入完成：${totalImport} 条已导入${totalSkip > 0 ? `，${totalSkip} 条其他账号/门店数据已跳过` : ""}。`,
      };
    } catch (e) {
      return { success: false, message: "导入失败：" + (e as Error).message };
    }
  }, [currentAccount, currentStore, previewImport]);

  return {
    // 状态
    topics, characters, stories, scripts, media, publishes, analytics,
    reviews, adDecisions, experiments, templates, hotCases, videoAnalyses, warRoomByScope,
    currentAccount, currentStore,
    // 账号门店
    setCurrentAccount, setCurrentStore,
    // 作战台
    getWarRoomTasks, toggleWarRoomTask, setWarRoomTask,
    // 导出导入
    exportData, importData, previewImport,
    // 人物库（含shared支持）
    getVisibleCharacters,
    addCharacter, updateCharacter, removeCharacter,
    // CRUD
    addTopic: (t: Omit<Topic, "id" | "accountId" | "storeId">) => addScoped(setTopics, t),
    createScriptFromTopic,
    updateTopic: (id: string, patch: Partial<Topic>) => updateScoped(setTopics, id, patch),
    removeTopic: (id: string) => removeScoped(setTopics, id),
    addStory: (s: Omit<Story, "id" | "accountId" | "storeId">) => addScoped(setStories, s),
    updateStory: (id: string, patch: Partial<Story>) => updateScoped(setStories, id, patch),
    removeStory: (id: string) => removeScoped(setStories, id),
    addScript: (s: Omit<Script, "id" | "accountId" | "storeId">) => addScoped(setScripts, s),
    updateScript: (id: string, patch: Partial<Script>) => updateScoped(setScripts, id, patch),
    removeScript: (id: string) => removeScoped(setScripts, id),
    addMedia: (m: Omit<MediaItem, "id" | "accountId" | "storeId">) => addScoped(setMedia, m),
    updateMedia: (id: string, patch: Partial<MediaItem>) => updateScoped(setMedia, id, patch),
    removeMedia: (id: string) => removeScoped(setMedia, id),
    addVideoAnalysis: (a: Omit<VideoAnalysis, "id" | "accountId" | "storeId">) => addScoped(setVideoAnalyses, a),
    updateVideoAnalysis: (id: string, patch: Partial<VideoAnalysis>) => updateScoped(setVideoAnalyses, id, patch),
    removeVideoAnalysis: (id: string) => removeScoped(setVideoAnalyses, id),
    addPublish: (p: Omit<PublishRecord, "id" | "accountId" | "storeId">) => addScoped(setPublishes, p),
    updatePublish: (id: string, patch: Partial<PublishRecord>) => updateScoped(setPublishes, id, patch),
    removePublish: (id: string) => removeScoped(setPublishes, id),
    addAnalytics: (a: Omit<VideoAnalytics, "id" | "accountId" | "storeId">) => addScoped(setAnalytics, a),
    updateAnalytics: (id: string, patch: Partial<VideoAnalytics>) => updateScoped(setAnalytics, id, patch),
    removeAnalytics: (id: string) => removeScoped(setAnalytics, id),
    addReview: (r: Omit<Review, "id" | "accountId" | "storeId">) => addScoped(setReviews, r),
    updateReview: (id: string, patch: Partial<Review>) => updateScoped(setReviews, id, patch),
    removeReview: (id: string) => removeScoped(setReviews, id),
    addAdDecision: (a: Omit<AdDecision, "id" | "accountId" | "storeId">) => addScoped(setAdDecisions, a),
    updateAdDecision: (id: string, patch: Partial<AdDecision>) => updateScoped(setAdDecisions, id, patch),
    removeAdDecision: (id: string) => removeScoped(setAdDecisions, id),
    addExperiment: (e: Omit<LabExperiment, "id" | "accountId" | "storeId">) => addScoped(setLabExperiments, e),
    updateExperiment: (id: string, patch: Partial<LabExperiment>) => updateScoped(setLabExperiments, id, patch),
    removeExperiment: (id: string) => removeScoped(setLabExperiments, id),
    addTemplate: (t: Omit<WinningTemplate, "id" | "accountId" | "storeId">) => addScoped(setTemplates, t),
    updateTemplate: (id: string, patch: Partial<WinningTemplate>) => updateScoped(setTemplates, id, patch),
    removeTemplate: (id: string) => removeScoped(setTemplates, id),
    addHotCase: (h: Omit<HotCase, "id" | "accountId" | "storeId">) => addScoped(setHotCases, h),
    updateHotCase: (id: string, patch: Partial<HotCase>) => updateScoped(setHotCases, id, patch),
    removeHotCase: (id: string) => removeScoped(setHotCases, id),
    filterByCurrent,
  };
}
export type SelfMediaStore = ReturnType<typeof useSelfMediaStore>;
