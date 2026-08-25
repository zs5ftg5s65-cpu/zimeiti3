import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Target, FileText, Video, Upload, BarChart3,
  CheckCircle2, Circle, Sparkles, Store, User,
} from "lucide-react";
import { toast } from "sonner";
import { THIRTY_DAY_PLAN } from "@/data/selfmedia-daily";
import type { SelfMediaStore } from "@/hooks/useSelfMediaStore";
import { accountName, storeName } from "@/data/selfmedia3-types";
import { ShootingRestrictionBadge, DataBackupBar } from "./shared";

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

export default function WarRoomPanel({ store, currentDay, onNavigate }: Props) {
  const dayPlan = useMemo(
    () => THIRTY_DAY_PLAN.find((d) => d.day === currentDay),
    [currentDay],
  );

  // 按账号+门店+Day隔离的任务状态
  const tasks = store.getWarRoomTasks(currentDay);

  const todayTopics = useMemo(
    () => store.topics.filter((t) => t.accountId === store.currentAccount && t.storeId === store.currentStore).slice(0, 1),
    [store.topics, store.currentAccount, store.currentStore],
  );
  const todayScripts = useMemo(
    () => store.scripts.filter((s) => s.accountId === store.currentAccount && s.storeId === store.currentStore).slice(0, 1),
    [store.scripts, store.currentAccount, store.currentStore],
  );
  const yesterdayAnalytics = useMemo(
    () => store.analytics.filter((a) => a.accountId === store.currentAccount && a.storeId === store.currentStore).slice(0, 1),
    [store.analytics, store.currentAccount, store.currentStore],
  );

  const toggleTask = (key: keyof typeof tasks) => {
    store.toggleWarRoomTask(currentDay, key);
  };

  const completedCount = Object.values(tasks).filter(Boolean).length;

  // 选题→脚本闭环：自动创建绑定sourceTopicId的脚本
  const handleGenerateScript = (topicId: string) => {
    const topic = store.topics.find((t) => t.id === topicId);
    if (!topic) return;
    const existing = store.scripts.find(
      (s) => s.sourceTopicId === topicId && s.accountId === store.currentAccount && s.storeId === store.currentStore,
    );
    if (existing) {
      store.updateTopic(topicId, { status: "已生成脚本" });
      toast.success("已有该选题的脚本，直接进入");
      onNavigate("script");
      return;
    }
    store.addScript({
      title: topic.title,
      sourceTopicId: topic.id,
      targetUser: topic.targetUser,
      goal: topic.cta,
      person: topic.recommendedPerson || "老板娘",
      dish: topic.recommendedDish,
      estimatedDuration: topic.estimatedDuration || "45秒",
      contentType: topic.contentType,
      shots: [
        { shotNumber: 1, time: "0-3s", shotSize: "近景", visual: "", action: "", dialogue: topic.hook, subtitle: "", sound: "", shootingNote: "", editingNote: "", isRequired: true, status: "未拍" },
        { shotNumber: 2, time: "3-15s", shotSize: "中景", visual: "", action: "", dialogue: "", subtitle: "", sound: "", shootingNote: "", editingNote: "", isRequired: true, status: "未拍" },
        { shotNumber: 3, time: "15-30s", shotSize: "中景", visual: "", action: "", dialogue: "", subtitle: "", sound: "", shootingNote: "", editingNote: "", isRequired: true, status: "未拍" },
      ],
      requiredMediaIds: [],
      shootingOrder: "",
      requiredShots: "",
      optionalShots: "",
      missingMaterials: topic.factsToConfirm ? `需确认：${topic.factsToConfirm}` : "",
      status: "草稿",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    store.updateTopic(topicId, { status: "已生成脚本" });
    store.toggleWarRoomTask(currentDay, "script");
    toast.success("已根据选题创建脚本");
    onNavigate("script");
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <CalendarDays className="size-3 mr-1" />
                {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
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
              <button
                key={t.key}
                onClick={() => { toggleTask(t.key); onNavigate(t.tab); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                {done ? (
                  <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="size-5 text-muted-foreground/40 shrink-0" />
                )}
                <t.icon className={`size-4 shrink-0 ${done ? "text-green-500" : "text-muted-foreground"}`} />
                <span className={`text-sm flex-1 ${done ? "line-through text-muted-foreground" : ""}`}>{t.label}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600" />今日推荐选题
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                  <Button size="sm" onClick={() => { store.updateTopic(t.id, { status: "已采用" }); store.toggleWarRoomTask(currentDay, "topic"); }}>采用</Button>
                  <Button size="sm" variant="outline" onClick={() => onNavigate("topic")}>换一个</Button>
                  <Button size="sm" variant="outline" onClick={() => handleGenerateScript(t.id)}>生成脚本</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-muted-foreground">暂无选题，去AI选题引擎生成</p>
              <Button size="sm" onClick={() => onNavigate("topic")}>
                <Sparkles className="size-3.5 mr-1" />去生成选题
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {todayScripts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="size-4 text-primary" />今日脚本
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayScripts.map((s) => (
              <div key={s.id} className="space-y-1">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.shots.length}个镜头 · {s.estimatedDuration}</p>
                {s.sourceTopicId && <p className="text-[10px] text-blue-600">已绑定来源选题</p>}
                <Button size="sm" variant="outline" className="mt-1" onClick={() => onNavigate("script")}>查看脚本</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
