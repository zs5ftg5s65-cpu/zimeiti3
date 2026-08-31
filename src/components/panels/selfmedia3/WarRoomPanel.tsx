import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Target, FileText, Video, Upload, BarChart3,
  CheckCircle2, Circle, Sparkles, Store, User, Flame, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { THIRTY_DAY_PLAN } from "@/data/selfmedia-daily";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import { accountName, storeName } from "@/data/selfmedia3-types";
import { formatDayLabelCN } from "@/lib/studyDate";
import { ShootingRestrictionBadge, DataBackupBar } from "./shared";
import { buildTopicPrompt, buildScriptPrompt } from "./aiPrompts";
import { callAI, extractJSON } from "@/lib/aiService";
import { loadAIConfig } from "@/lib/aiConfig";
import { fetchHotCandidates } from "@/lib/hotService";
import { normalizeHotAnalysis } from "@/lib/hotService";
import type { ContentType, TopicRiskLevel, Shot } from "@/data/selfmedia3-types";

interface Props {
  store: SelfMediaStore;
  currentDay: number;
  onNavigate: (tab: string) => void;
}

const TASK_DEFS = [
  { key: "topic", label: "今日选题", icon: Sparkles, tab: "topic" },
  { key: "script", label: "今日脚本", icon: FileText, tab: "script" },
  { key: "shoot", label: "今日拍摄", icon: Video, tab: "media" },
  { key: "publish", label: "今日发布", icon: Upload, tab: "publish" },
  { key: "data", label: "今日数据", icon: BarChart3, tab: "analytics" },
  { key: "review", label: "今日复盘", icon: Target, tab: "review" },
] as const;

function localISODate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readAutoCollectState(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem("__sm3_hot_last_auto_collect") || "{}") as Record<string, string>; } catch { return {}; }
}

function writeAutoCollectState(state: Record<string, string>) {
  try { localStorage.setItem("__sm3_hot_last_auto_collect", JSON.stringify(state)); } catch { /* quota/SSR */ }
}

export default function WarRoomPanel({ store, currentDay, onNavigate }: Props) {
  const dayPlan = useMemo(
    () => THIRTY_DAY_PLAN.find((d) => d.day === currentDay),
    [currentDay],
  );

  // 按账号+门店+Day隔离的任务状态
  const tasks = store.getWarRoomTasks(currentDay);

  const todayTopics = useMemo(
    () => store.topics.filter((t) =>
      t.accountId === store.currentAccount &&
      t.storeId === store.currentStore &&
      t.day === currentDay
    ).sort((a, b) => b.createdAt - a.createdAt),
    [store.topics, store.currentAccount, store.currentStore, currentDay],
  );
  const todayScripts = useMemo(
    () => store.scripts.filter((s) =>
      s.accountId === store.currentAccount &&
      s.storeId === store.currentStore &&
      s.day === currentDay
    ).sort((a, b) => b.createdAt - a.createdAt),
    [store.scripts, store.currentAccount, store.currentStore, currentDay],
  );
  const yesterdayAnalytics = useMemo(
    () => store.analytics.filter((a) => a.accountId === store.currentAccount && a.storeId === store.currentStore).slice(0, 1),
    [store.analytics, store.currentAccount, store.currentStore],
  );

  // 今日作战台直接读取“昨日热门”，避免用户每天还要跳到热门案例库。
  // 优先昨日采集，其次按与当前Day的相关度/采集时间兜底；绝不伪造热度。
  const yesterdayHotCases = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const scoped = store.hotCases.filter((h) =>
      h.accountId === store.currentAccount &&
      h.storeId === store.currentStore
    );
    const yesterdayOnly = scoped.filter((h) => h.collectedAt === yesterday);
    const source = yesterdayOnly.length > 0 ? yesterdayOnly : scoped;
    return [...source]
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0) || (b.hotRank ? -b.hotRank : 0) - (a.hotRank ? -a.hotRank : 0) || b.collectedAt.localeCompare(a.collectedAt))
      .slice(0, 3);
  }, [store.hotCases, store.currentAccount, store.currentStore]);

  const toggleTask = (key: keyof typeof tasks) => {
    const previousValue = Boolean(tasks[key]);
    const nextValue = !previousValue;
    store.setWarRoomTask(currentDay, key, nextValue);

    // 防误触：每次完成/取消完成后提供一次“撤销”操作。
    // 撤销只恢复本次点击前的状态，不影响其他任务。
    toast(nextValue ? `已完成：${TASK_DEFS.find((t) => t.key === key)?.label ?? "任务"}` : `已取消完成：${TASK_DEFS.find((t) => t.key === key)?.label ?? "任务"}`, {
      action: {
        label: "撤销",
        onClick: () => {
          store.setWarRoomTask(currentDay, key, previousValue);
          toast.success("已撤销本次操作");
        },
      },
      duration: 5000,
    });
  };

  const completedCount = Object.values(tasks).filter(Boolean).length;

  const [aiGenerating, setAiGenerating] = useState(false);
  const [hotWorking, setHotWorking] = useState(false);
  const [hotActionId, setHotActionId] = useState<string | null>(null);

  const collectYesterdayForToday = async (silent = false) => {
    if (hotWorking) return;
    setHotWorking(true);
    try {
      const yesterday = localISODate(-1);
      const keywords = [dayPlan?.dailyTheme || "", dayPlan?.topic || "", "餐饮老板娘", "实体店老板", "本地生活", "江阴美食"].filter(Boolean);
      const result = await fetchHotCandidates(keywords, yesterday);
      const existingKeys = new Set(store.hotCases.map((h) => `${h.platform}|${h.title}|${h.collectedAt}`));
      let added = 0;
      result.items.forEach((item) => {
        const key = `${item.platform}|${item.title}|${item.collectedAt}`;
        if (existingKeys.has(key)) return;
        store.addHotCase({
          platform: item.platform, account: item.account, title: item.title, url: item.url,
          publishTime: item.publishTime, collectedAt: item.collectedAt, data: item.data, verified: item.verified,
          remark: item.remark || "", sourceType: item.sourceType, sourceQuery: item.sourceQuery,
          relevanceScore: item.relevanceScore, hotRank: item.hotRank, metrics: item.metrics, analysisStatus: "未分析",
        });
        added += 1;
      });
      const state = readAutoCollectState();
      state[`${store.currentAccount}|${store.currentStore}`] = yesterday;
      writeAutoCollectState(state);
      if (!silent) toast.success(added > 0 ? `已获取昨日热门${added}条候选` : "昨日热门已有缓存或暂未搜到候选");
    } catch (error) {
      if (!silent) toast.error(error instanceof Error ? error.message : "昨日热门采集失败");
    } finally { setHotWorking(false); }
  };

  useEffect(() => {
    const state = readAutoCollectState();
    const scopeKey = `${store.currentAccount}|${store.currentStore}`;
    const yesterday = localISODate(-1);
    const hasYesterday = store.hotCases.some((h) => h.accountId === store.currentAccount && h.storeId === store.currentStore && h.collectedAt === yesterday);
    if (!hasYesterday && state[scopeKey] !== yesterday) void collectYesterdayForToday(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, store.currentAccount, store.currentStore]);

  const analyzeHotForToday = async (h: (typeof yesterdayHotCases)[number]) => {
    if (hotActionId) return;
    setHotActionId(h.id);
    try {
      const task = dayPlan ? `Day${currentDay}｜${dayPlan.dailyTheme}｜${dayPlan.dailyGoal}｜${dayPlan.shootingTask}｜${dayPlan.mustProduce}` : `Day${currentDay}`;
      const chars = store.getVisibleCharacters().map((c) => `${c.name}｜${c.personality}｜${c.speakingStyle}`).join("\n") || "暂无人物资料";
      const result = await callAI(buildHotAnalysisPrompt(h, task, chars), loadAIConfig());
      const analysis = normalizeHotAnalysis(extractJSON<Record<string, unknown>>(result.content));
      store.updateHotCase(h.id, { analysisStatus: "已分析", analysis });
      toast.success("热门案例AI拆解完成");
    } catch (error) {
      store.updateHotCase(h.id, { analysisStatus: "分析失败" });
      toast.error(error instanceof Error ? error.message : "AI拆解失败");
    } finally { setHotActionId(null); }
  };

  const generateFromHotForToday = async (h: (typeof yesterdayHotCases)[number]) => {
    if (!h.analysis || hotActionId) return;
    setHotActionId(h.id);
    try {
      const result = await callAI(`请把以下热门案例的可迁移结构改造成我的原创餐饮老板娘账号Day${currentDay}选题。不得照抄原标题、台词或表达，不得编造事实。\n案例：${h.title}\n平台：${h.platform}\nAI拆解：${JSON.stringify(h.analysis)}\n今日任务：${dayPlan?.dailyTheme || ""}｜${dayPlan?.dailyGoal || ""}｜${dayPlan?.shootingTask || ""}\n只返回JSON：{"title":"","riskLevel":"测试型","targetUser":"","painPoint":"","contentType":"老板娘口播","coreOpinion":"","recommendedStore":"","recommendedPerson":"老板娘","recommendedDish":"","hook":"","structure":"","cta":"","reason":"","risk":"","factsToConfirm":"","involvesCustomer":false,"estimatedDuration":"45秒","shootingDifficulty":"中等"}`, loadAIConfig());
      const t = extractJSON<Record<string, unknown>>(result.content);
      const topic = store.addTopic({
        day: currentDay, title: String(t.title || `Day${currentDay}热门改造`), riskLevel: (t.riskLevel || "测试型") as TopicRiskLevel,
        targetUser: String(t.targetUser || ""), painPoint: String(t.painPoint || ""), contentType: (t.contentType || "老板娘口播") as ContentType,
        coreOpinion: String(t.coreOpinion || ""), recommendedStore: String(t.recommendedStore || ""), recommendedPerson: String(t.recommendedPerson || "老板娘"),
        recommendedDish: String(t.recommendedDish || ""), hook: String(t.hook || ""), structure: String(t.structure || ""), cta: String(t.cta || ""),
        reason: `参考${h.platform}昨日案例《${h.title}》并结合Day${currentDay}任务原创改造`, risk: String(t.risk || ""), factsToConfirm: String(t.factsToConfirm || ""),
        involvesCustomer: Boolean(t.involvesCustomer), estimatedDuration: String(t.estimatedDuration || "45秒"), shootingDifficulty: (t.shootingDifficulty || "中等") as "简单" | "中等" | "较难",
        status: "待采用", createdAt: Date.now(),
      });
      const script = store.createScriptFromTopic(topic.id, currentDay);
      store.updateHotCase(h.id, { generatedTopicId: topic.id, generatedScriptId: script?.id });
      store.setWarRoomTask(currentDay, "topic", true);
      if (script) store.setWarRoomTask(currentDay, "script", true);
      toast.success(script ? "已生成今日原创选题+完整脚本" : "已生成今日原创选题");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "原创改造失败");
    } finally { setHotActionId(null); }
  };

  const generateTodayWithAI = async () => {
    if (aiGenerating) return;
    setAiGenerating(true);
    try {
      const topicResult = await callAI(buildTopicPrompt(store, currentDay) + "\n\n【机器读取要求】最后只返回JSON数组，不要Markdown，不要解释。", loadAIConfig());
      const raw = extractJSON<unknown>(topicResult.content);
      const list = Array.isArray(raw) ? raw : Array.isArray((raw as { topics?: unknown[] })?.topics) ? (raw as { topics: unknown[] }).topics : [];
      if (list.length === 0) throw new Error("AI没有返回有效选题数组");
      const created = list.slice(0, 3).map((item, index) => {
        const t = (item || {}) as Record<string, unknown>;
        return store.addTopic({
          day: currentDay, title: String(t.title || `Day${currentDay} AI选题${index + 1}`),
          riskLevel: (t.riskLevel || ["稳妥型", "测试型", "突破型"][index]) as TopicRiskLevel,
          targetUser: String(t.targetUser || ""), painPoint: String(t.painPoint || ""),
          contentType: (t.contentType || "老板娘口播") as ContentType, coreOpinion: String(t.coreOpinion || ""),
          recommendedStore: String(t.recommendedStore || ""), recommendedPerson: String(t.recommendedPerson || "老板娘"),
          recommendedDish: String(t.recommendedDish || ""), hook: String(t.hook || ""), structure: String(t.structure || ""),
          cta: String(t.cta || ""), reason: String(t.reason || "AI根据今日任务生成"), risk: String(t.risk || ""),
          factsToConfirm: String(t.factsToConfirm || ""), involvesCustomer: Boolean(t.involvesCustomer),
          estimatedDuration: String(t.estimatedDuration || "30-60秒"), shootingDifficulty: (t.shootingDifficulty || "中等") as "简单" | "中等" | "较难",
          status: "待采用", createdAt: Date.now(),
        });
      });
      const primary = created.find((t) => t.riskLevel === "稳妥型") || created[0];
      if (!primary) throw new Error("没有生成有效选题");

      const scriptPrompt = buildScriptPrompt(store, primary, currentDay) + `\n\n【机器读取要求】只返回一个JSON对象，不要Markdown，不要解释。结构必须为：\n{\"title\":\"\",\"targetUser\":\"\",\"goal\":\"\",\"person\":\"\",\"dish\":\"\",\"estimatedDuration\":\"\",\"contentType\":\"\",\"shootingOrder\":\"\",\"requiredShots\":\"\",\"optionalShots\":\"\",\"missingMaterials\":\"\",\"shots\":[{\"shotNumber\":1,\"time\":\"\",\"shotSize\":\"\",\"visual\":\"\",\"action\":\"\",\"dialogue\":\"\",\"subtitle\":\"\",\"sound\":\"\",\"shootingNote\":\"\",\"editingNote\":\"\",\"isRequired\":true}]}\n镜头至少8个，必须可直接拍摄。`;
      const scriptResult = await callAI(scriptPrompt, loadAIConfig());
      const scriptRaw = extractJSON<Record<string, unknown>>(scriptResult.content);
      const rawShots = Array.isArray(scriptRaw.shots) ? scriptRaw.shots : [];
      if (rawShots.length < 8) throw new Error("AI返回的完整脚本少于8个镜头，请重试");
      const shots: Shot[] = rawShots.map((rawShot, index) => {
        const x = (rawShot || {}) as Record<string, unknown>;
        return {
          shotNumber: index + 1, time: String(x.time || ""), shotSize: String(x.shotSize || "中景"),
          visual: String(x.visual || ""), action: String(x.action || ""), dialogue: String(x.dialogue || ""),
          subtitle: String(x.subtitle || ""), sound: String(x.sound || ""), shootingNote: String(x.shootingNote || ""),
          editingNote: String(x.editingNote || ""), isRequired: x.isRequired !== false, status: "未拍",
        };
      });
      const script = store.addScript({
        day: currentDay, topicId: primary.id, sourceTopicId: primary.id,
        title: String(scriptRaw.title || primary.title), targetUser: String(scriptRaw.targetUser || primary.targetUser),
        goal: String(scriptRaw.goal || dayPlan?.dailyGoal || "完成今日内容"), person: String(scriptRaw.person || primary.recommendedPerson || "老板娘"),
        dish: String(scriptRaw.dish || primary.recommendedDish || ""), estimatedDuration: String(scriptRaw.estimatedDuration || primary.estimatedDuration || "45秒"),
        contentType: (scriptRaw.contentType || primary.contentType) as ContentType, shots, requiredMediaIds: [],
        shootingOrder: String(scriptRaw.shootingOrder || "按镜头1→8顺序拍摄"), requiredShots: String(scriptRaw.requiredShots || "镜头1-8"),
        optionalShots: String(scriptRaw.optionalShots || ""), missingMaterials: String(scriptRaw.missingMaterials || ""),
        status: "草稿", createdAt: Date.now(), updatedAt: Date.now(),
      });
      store.updateTopic(primary.id, { status: "已生成脚本" });
      store.setWarRoomTask(currentDay, "topic", true);
      store.setWarRoomTask(currentDay, "script", true);
      toast.success(`AI已生成${created.length}个今日选题，并生成${script.shots.length}镜头完整脚本`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI生成失败");
    } finally { setAiGenerating(false); }
  };

  // 选题→脚本闭环：统一由store生成完整可执行脚本
  const handleGenerateScript = (topicId: string) => {
    const script = store.createScriptFromTopic(topicId, currentDay);
    if (!script) return;
    store.setWarRoomTask(currentDay, "script", true);
    toast.success("已生成今日完整脚本，共8个必拍镜头");
    onNavigate("script");
  };

  const handleAdoptTopic = (topicId: string) => {
    store.updateTopic(topicId, { status: "已采用" });
    const script = store.createScriptFromTopic(topicId, currentDay);
    if (script) {
      store.setWarRoomTask(currentDay, "topic", true);
      toast.success("已采用，并自动生成今日完整脚本");
    } else {
      toast.success("选题已采用");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <CalendarDays className="size-3 mr-1" />
                {formatDayLabelCN(currentDay)}
              </Badge>
              <Badge className="text-xs">Day {currentDay} / 30</Badge>
              {dayPlan && <Badge variant="secondary" className="text-xs">{dayPlan.stage}</Badge>}
            </div>
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{accountName(store.currentAccount)}</span>
              <Store className="size-3.5 text-muted-foreground ml-1" />
              <span className="text-xs text-muted-foreground">{storeName(store.currentStore)}</span>
            </div>
          </div>
          {dayPlan && (
            <div className="mt-3">
              <h3 className="text-base font-bold">{dayPlan.dailyTheme}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{dayPlan.dailyGoal}</p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(completedCount / 6) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{completedCount}/6</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="size-4 text-primary" />今日任务
            <span className="text-[10px] text-muted-foreground font-normal">（{accountName(store.currentAccount)}·{storeName(store.currentStore)}·Day{currentDay}）</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TASK_DEFS.map((t) => {
            const done = tasks[t.key];
            return (
              <div
                key={t.key}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(t.key)}
                  className="shrink-0"
                  aria-label={`${t.label}${done ? "取消完成" : "标记完成"}`}
                >
                  {done ? (
                    <CheckCircle2 className="size-5 text-green-500" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground/40" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate(t.tab)}
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                >
                  <t.icon className={`size-4 shrink-0 ${done ? "text-green-500" : "text-muted-foreground"}`} />
                  <span className={`text-sm flex-1 ${done ? "line-through text-muted-foreground" : ""}`}>{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">进入</span>
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {dayPlan && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Day {currentDay} 今日任务对应方向</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <p className="text-sm font-medium">{dayPlan.topic}</p>
            <p className="text-xs text-muted-foreground">任务：{dayPlan.shootingTask}</p>
            <p className="text-xs text-muted-foreground">脚本：{dayPlan.scriptTask}</p>
            <p className="text-xs text-muted-foreground">必须产出：{dayPlan.mustProduce}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600" />今日推荐选题
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={generateTodayWithAI} disabled={aiGenerating}>
            <Sparkles className="size-3.5 mr-1" />{aiGenerating ? "AI正在生成今日选题+完整脚本…" : todayTopics.length > 0 ? "AI重新生成今日选题+完整脚本" : "AI一键生成今日选题+完整脚本"}
          </Button>
          {todayTopics.length > 0 ? (
            todayTopics.map((t) => (
              <div key={t.id} className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{t.contentType}</Badge>
                  <Badge variant="secondary">{t.riskLevel}</Badge>
                  <Badge variant="outline">{t.estimatedDuration}</Badge>
                  <ShootingRestrictionBadge />
                </div>
                <h4 className="text-sm font-semibold">{t.title}</h4>
                <p className="text-xs text-muted-foreground">Hook：{t.hook}</p>
                <p className="text-xs text-muted-foreground">目标：{t.targetUser}</p>
                <div className="flex gap-2 flex-wrap pt-1">
                  <Button size="sm" onClick={() => handleAdoptTopic(t.id)}>采用</Button>
                  <Button size="sm" variant="outline" onClick={() => onNavigate("topic")}>换一个</Button>
                  <Button size="sm" variant="outline" onClick={() => handleGenerateScript(t.id)}>生成完整脚本</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-muted-foreground">当前 Day 暂无已绑定选题，可根据上方今日任务去选题引擎生成</p>
              <Button size="sm" onClick={() => onNavigate("topic")}>
                <Sparkles className="size-3.5 mr-1" />去生成选题
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="size-4 text-orange-600" />昨日热门 · 今日参考
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => void collectYesterdayForToday(false)} disabled={hotWorking}>
                {hotWorking ? "采集中…" : "更新昨日热门"}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onNavigate("hot")}>
                查看全部 <ExternalLink className="size-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {yesterdayHotCases.length === 0 ? (
            <div className="text-center py-3 space-y-2">
              <p className="text-xs text-muted-foreground">暂时没有昨日热门案例。先联网获取昨日热门，或手动添加案例。</p>
              <Button size="sm" variant="outline" onClick={() => onNavigate("hot")}>
                <Flame className="size-3.5 mr-1" />去获取昨日热门
              </Button>
            </div>
          ) : (
            yesterdayHotCases.map((h, index) => (
              <div key={h.id} className="rounded-lg border bg-background p-2.5 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-4">{index + 1}. {h.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{h.platform || "未知平台"} · {h.account || "未知账号"} · {h.collectedAt || "日期未知"}</p>
                  </div>
                  {h.analysisStatus === "已分析" && <Badge className="shrink-0 text-[9px]">AI已拆解</Badge>}
                </div>
                {h.analysis?.fitToTodayTask && (
                  <p className="text-[11px] text-muted-foreground leading-4"><span className="font-medium text-foreground">与今日任务：</span>{h.analysis.fitToTodayTask}</p>
                )}
                {h.data && <p className="text-[10px] text-muted-foreground">热度：{h.data}</p>}
                <div className="flex gap-1.5 flex-wrap">
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={hotActionId === h.id} onClick={() => void analyzeHotForToday(h)}>
                    {hotActionId === h.id ? "AI处理中…" : h.analysisStatus === "已分析" ? "重新AI拆解" : "AI拆解"}
                  </Button>
                  {h.generatedScriptId ? (
                    <Button size="sm" className="h-7 text-[11px]" onClick={() => onNavigate("script")}>查看今日脚本</Button>
                  ) : (
                    <Button size="sm" className="h-7 text-[11px]" disabled={!h.analysis || hotActionId === h.id} onClick={() => void generateFromHotForToday(h)}>AI原创改造</Button>
                  )}
                </div>
              </div>
            ))
          )}
          <p className="text-[10px] text-muted-foreground">提示：搜索候选没有官方热度数据时只显示“未提供”，系统不会编造播放量/点赞量。</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="size-4 text-primary" />今日脚本
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayScripts.length > 0 ? todayScripts.map((s) => (
            <div key={s.id} className="space-y-1">
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.shots.length}个镜头 · {s.estimatedDuration}</p>
              {s.sourceTopicId && <p className="text-[10px] text-blue-600">已绑定今日选题 · Day{currentDay}</p>}
              <Button size="sm" variant="outline" className="mt-1" onClick={() => onNavigate("script")}>查看脚本</Button>
            </div>
          )) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">当前 Day 还没有已绑定脚本。点击上方AI按钮可直接生成今日选题并自动生成完整脚本。</p>
              <Button size="sm" variant="outline" onClick={generateTodayWithAI} disabled={aiGenerating}><Sparkles className="size-3.5 mr-1" />一键生成今日完整内容</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {yesterdayAnalytics.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="size-4 text-green-600" />最近数据
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yesterdayAnalytics.map((a) => (
              <div key={a.id} className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold tabular-nums">{a.views}</p><p className="text-xs text-muted-foreground">播放</p></div>
                <div><p className="text-lg font-bold tabular-nums">{a.likes}</p><p className="text-xs text-muted-foreground">点赞</p></div>
                <div><p className="text-lg font-bold tabular-nums">{a.newFollowers}</p><p className="text-xs text-muted-foreground">涨粉</p></div>
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => onNavigate("analytics")}>查看详细数据</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => onNavigate("topic")}>
          <Sparkles className="size-4" /><span className="text-xs">AI选题引擎</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => onNavigate("script")}>
          <FileText className="size-4" /><span className="text-xs">脚本导演</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => onNavigate("media")}>
          <Video className="size-4" /><span className="text-xs">素材库</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => onNavigate("publish")}>
          <Upload className="size-4" /><span className="text-xs">发布管理</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground/70">数据备份</p>
            <p>数据存储在浏览器本地，建议定期导出备份</p>
          </div>
          <DataBackupBar store={store} />
        </CardContent>
      </Card>
    </div>
  );
}
