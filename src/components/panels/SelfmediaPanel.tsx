import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Video, FileText, BarChart3, Lightbulb, CheckCircle2, EyeOff,
  CalendarDays, Sparkles, Target, Folder, Store, User, Send, Film,
  BookOpen, Award, Flame, FlaskConical, TrendingUp, LayoutDashboard,
} from "lucide-react";
import { MOCK_SELFMEDIA_MODULES } from "@/data/selfmedia";
import { MOCK_SELFMEDIA_DAILY } from "@/data/selfmedia-daily";
import { useSelfMediaStore } from "@/hooks/useSelfMediaStore";
import { ACCOUNT_OPTIONS, STORE_OPTIONS } from "@/data/selfmedia3-types";
// 3.0 面板
import WarRoomPanel from "@/components/panels/selfmedia3/WarRoomPanel";
import TopicEnginePanel from "@/components/panels/selfmedia3/TopicEnginePanel";
import CharacterPanel from "@/components/panels/selfmedia3/CharacterPanel";
import StoryLibraryPanel from "@/components/panels/selfmedia3/StoryLibraryPanel";
import ScriptDirectorPanel from "@/components/panels/selfmedia3/ScriptDirectorPanel";
import MediaLibraryPanel from "@/components/panels/selfmedia3/MediaLibraryPanel";
import PublishPanel from "@/components/panels/selfmedia3/PublishPanel";
import AnalyticsPanel from "@/components/panels/selfmedia3/AnalyticsPanel";
import ReviewPanel from "@/components/panels/selfmedia3/ReviewPanel";
import AdDecisionPanel from "@/components/panels/selfmedia3/AdDecisionPanel";
import ContentLabPanel from "@/components/panels/selfmedia3/ContentLabPanel";
import WinningTemplatesPanel from "@/components/panels/selfmedia3/WinningTemplatesPanel";
import HotCasesPanel from "@/components/panels/selfmedia3/HotCasesPanel";
// 旧面板（仅保留静态知识库和30天计划用的引用）
import OperationRefPanel from "@/components/panels/selfmedia/OperationRefPanel";

interface SelfmediaPanelProps {
  activeModule: string;
  initialTab: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  currentDay?: number;
}

// 3.0 Tab 定义
const SM3_TABS = [
  { value: "warroom", label: "今日作战台", icon: LayoutDashboard },
  { value: "topic", label: "选题引擎", icon: Sparkles },
  { value: "character", label: "人物库", icon: User },
  { value: "story", label: "故事库", icon: BookOpen },
  { value: "script", label: "脚本导演", icon: Film },
  { value: "media", label: "素材库", icon: Folder },
  { value: "publish", label: "发布管理", icon: Send },
  { value: "analytics", label: "数据诊断", icon: BarChart3 },
  { value: "review", label: "AI复盘", icon: Target },
  { value: "ad", label: "投流判断", icon: TrendingUp },
  { value: "lab", label: "内容实验室", icon: FlaskConical },
  { value: "templates", label: "成功模板", icon: Award },
  { value: "hotcases", label: "热门案例", icon: Flame },
  { value: "knowledge", label: "知识库", icon: Lightbulb },
  { value: "daily", label: "30天计划", icon: CalendarDays },
] as const;

type TabValue = typeof SM3_TABS[number]["value"];

// 根据导航入口映射初始tab
function mapInitialTab(activeModule: string, initialTab: string): TabValue {
  // 直接匹配3.0 moduleId
  const directMap: Record<string, TabValue> = {
    warroom: "warroom", topic: "topic", character: "character", story: "story",
    script: "script", media: "media", publish: "publish", history: "publish",
    analytics: "analytics", data: "analytics", review: "review", ad: "ad",
    lab: "lab", templates: "templates", hotcases: "hotcases", hot: "hotcases",
    operation: "knowledge", daily: "daily",
  };
  if (directMap[initialTab]) return directMap[initialTab];
  if (directMap[activeModule]) return directMap[activeModule];
  // 旧的静态模块 → 知识库
  if (activeModule.startsWith("selfmedia-")) return "knowledge";
  return "warroom";
}

function ModuleRenderer({ moduleId }: { moduleId: string }) {
  const mod = MOCK_SELFMEDIA_MODULES.find((m) => m.id === moduleId);
  if (!mod) return null;
  if (mod.type === "workflow" && mod.steps) {
    return (
      <div className="space-y-3">
        {mod.steps.map((step) => (
          <div key={step.order} className="flex gap-3 p-4 rounded-lg border border-border/50 bg-card">
            <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">{step.order}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h4 className="text-sm font-semibold">{step.title}</h4>
                <Badge variant="secondary" className="text-[11px]">{step.duration}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (mod.type === "sources" && mod.sources) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {mod.sources.map((s, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{s.platform}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">关键词</p>
                <div className="flex flex-wrap gap-1">
                  {s.keywords.map((kw, j) => (<Badge key={j} variant="secondary" className="text-[11px]">{kw}</Badge>))}
                </div>
              </div>
              <p className="text-xs text-foreground/80">{s.filter}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if ((mod.type === "dissectTemplate" || mod.type === "scriptTemplate") && mod.tableHeaders) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>{mod.tableHeaders.map((h, i) => (<th key={i} className="text-left px-4 py-2.5 text-xs font-medium whitespace-nowrap">{h}</th>))}</tr>
          </thead>
          <tbody>
            {mod.tableRows?.map((row, i) => (
              <tr key={i} className="border-t border-border/40">
                {row.map((cell, j) => (<td key={j} className="px-4 py-2.5 text-xs">{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (mod.type === "videoTypes" && mod.videoTypes) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {mod.videoTypes.map((vt, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{vt.name}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-foreground/80">{vt.description}</p>
              <div className="pt-2 border-t border-border/40">
                <p className="text-[11px] text-muted-foreground">示例</p>
                <p className="text-xs text-primary mt-0.5">{vt.example}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (mod.sections) {
    return (
      <div className="space-y-3">
        {mod.sections.map((s, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{s.title}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {s.items.map((item, j) => (<li key={j} className="flex items-start gap-2"><span className="text-xs text-primary mt-0.5">•</span><span>{item}</span></li>))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  return null;
}

function DailyPlanView({ onToggleComplete, currentDay }: { onToggleComplete: () => void; currentDay: number }) {
  const plan = MOCK_SELFMEDIA_DAILY.thirtyDayPlan;
  const weeks = [1, 2, 3, 4, 5].map((w) => plan.filter((d) => d.week === w));
  const [activeDay, setActiveDay] = useState<number>(currentDay);
  useEffect(() => setActiveDay(currentDay), [currentDay]);
  const current = plan.find((d) => d.day === activeDay);
  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {weeks.filter(w => w.length > 0).map((week, wi) => (
          <div key={wi} className="shrink-0">
            <p className="text-[11px] text-muted-foreground mb-1.5 px-1">第{week[0]?.week}周</p>
            <div className="flex gap-1">
              {week.map((d) => (
                <button key={d.day} onClick={() => setActiveDay(d.day)} className={`size-8 rounded-md text-xs font-medium tabular-nums ${activeDay === d.day ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>{d.day}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {current && (
        <motion.div key={current.day} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <Badge variant="outline" className="text-xs">第{current.day}天 · 第{current.week}周</Badge>
              <Badge variant="secondary" className="text-xs ml-2">{current.stage}</Badge>
              <h3 className="text-lg font-bold mt-2">{current.dailyTheme}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{current.dailyGoal}</p>
            </div>
            <Button size="sm" onClick={onToggleComplete} className="gap-1.5"><CheckCircle2 className="size-4" />标记完成</Button>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="size-4 text-foreground/70" />今日任务清单</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-sm leading-relaxed"><span className="font-medium">拍摄任务</span><p className="text-xs text-muted-foreground mt-0.5 ml-4">{current.shootingTask}</p></li>
                <li className="text-sm leading-relaxed"><span className="font-medium">脚本任务</span><p className="text-xs text-muted-foreground mt-0.5 ml-4">{current.scriptTask}</p></li>
                <li className="text-sm leading-relaxed"><span className="font-medium">发布任务</span><p className="text-xs text-muted-foreground mt-0.5 ml-4">{current.publishTask}</p></li>
                <li className="text-sm leading-relaxed"><span className="font-medium">数据记录</span><p className="text-xs text-muted-foreground mt-0.5 ml-4">{current.dataTask}</p></li>
                <li className="text-sm leading-relaxed"><span className="font-medium">复盘任务</span><p className="text-xs text-muted-foreground mt-0.5 ml-4">{current.reviewTask}</p></li>
              </ol>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="size-4 text-primary" />今日必须产出</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-foreground/85">{current.mustProduce}</p></CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default function SelfmediaPanel({ activeModule, initialTab, isCompleted, onToggleComplete, currentDay = 1 }: SelfmediaPanelProps) {
  const store = useSelfMediaStore();
  const [tab, setTab] = useState<TabValue>(() => mapInitialTab(activeModule, initialTab));

  // 当导航切换时同步tab
  useEffect(() => {
    setTab(mapInitialTab(activeModule, initialTab));
  }, [activeModule, initialTab]);

  const normalizedModuleId = activeModule.startsWith("selfmedia-") ? activeModule : `selfmedia-${activeModule}`;
  const knowledgeMod = MOCK_SELFMEDIA_MODULES.find((m) => m.id === normalizedModuleId);

  const handleAccountChange = (accountId: string) => {
    store.setCurrentAccount(accountId as typeof store.currentAccount);
  };

  const renderTabContent = () => {
    switch (tab) {
      case "warroom":
        return <WarRoomPanel store={store} currentDay={currentDay} onNavigate={(t) => setTab(t as TabValue)} />;
      case "topic":
        return <TopicEnginePanel store={store} onNavigate={(t) => setTab(t as TabValue)} />;
      case "character":
        return <CharacterPanel store={store} />;
      case "story":
        return <StoryLibraryPanel store={store} />;
      case "script":
        return <ScriptDirectorPanel store={store} />;
      case "media":
        return <MediaLibraryPanel store={store} />;
      case "publish":
        return <PublishPanel store={store} onNavigate={(t) => setTab(t as TabValue)} />;
      case "analytics":
        return <AnalyticsPanel store={store} onNavigate={(t) => setTab(t as TabValue)} />;
      case "review":
        return <ReviewPanel store={store} />;
      case "ad":
        return <AdDecisionPanel store={store} />;
      case "lab":
        return <ContentLabPanel store={store} />;
      case "templates":
        return <WinningTemplatesPanel store={store} />;
      case "hotcases":
        return <HotCasesPanel store={store} />;
      case "knowledge":
        return (
          <div className="space-y-4">
            {knowledgeMod ? (
              <>
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Video className="size-5 text-green-600" />{knowledgeMod.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-foreground/80">{knowledgeMod.description}</p></CardContent>
                </Card>
                <ModuleRenderer moduleId={knowledgeMod.id} />
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">从左侧导航选择具体知识库条目查看，或浏览运营参考资料。</p>
                <OperationRefPanel />
              </div>
            )}
          </div>
        );
      case "daily":
        return <DailyPlanView onToggleComplete={onToggleComplete} currentDay={currentDay} />;
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      {/* 账号/门店选择器 — 3.0 统一使用 store */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">账号：</span>
              <Select value={store.currentAccount} onValueChange={handleAccountChange}>
                <SelectTrigger className="w-[160px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_OPTIONS.map(a => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">门店：</span>
              <Select value={store.currentStore} onValueChange={(v) => store.setCurrentStore(v as typeof store.currentStore)} disabled={store.currentAccount === "bosslady"}>
                <SelectTrigger className="w-[160px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STORE_OPTIONS.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="ml-auto text-[10px]">自媒体3.0 · 3账号2门店</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">自媒体运营中枢</Badge>
          {isCompleted && (<Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="size-3 mr-1" />今日已完成</Badge>)}
        </div>
        <Button size="sm" variant={isCompleted ? "outline" : "default"} onClick={onToggleComplete} className="gap-1.5">
          {isCompleted ? (<><EyeOff className="size-4" />标记未完成</>) : (<><CheckCircle2 className="size-4" />标记已完成</>)}
        </Button>
      </div>

      {/* 横向滚动 Tab — 移动端友好 */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {SM3_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === t.value ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div>{renderTabContent()}</div>
    </motion.div>
  );
}
