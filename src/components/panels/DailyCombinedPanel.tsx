import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calculator,
  Languages,
  Video,
  BookOpen,
  Headphones,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  Sunset,
  Moon,
  RefreshCw, Flame, ExternalLink, Sparkles, Loader2, CheckCircle2 as CheckCircle2Icon,
} from 'lucide-react';
import type { IDayProgress } from '@/hooks/useStudyProgress';
import { MOCK_ACCOUNTING } from '@/data/accounting';
import { MOCK_ENGLISH_DAYS } from '@/data/english';
import { useWordLearning } from '@/hooks/useWordLearning';
import { useAccountingReview } from '@/hooks/useAccountingReview';
import { useSelfMediaStore } from '@/hooks/useSelfMediaStore';
import { THIRTY_DAY_PLAN } from '@/data/selfmedia-daily';
import { getDayDate, formatDateCN, weekdayCN } from '@/lib/studyDate';
import { toast } from 'sonner';
import { fetchHotCandidates, buildHotAnalysisPrompt, normalizeHotAnalysis } from '@/lib/hotService';
import { callAI, extractJSON } from '@/lib/aiService';
import { loadAIConfig } from '@/lib/aiConfig';
import { buildScriptPrompt } from '@/components/panels/selfmedia3/aiPrompts';
import type { ContentType, Shot, TopicRiskLevel } from '@/data/selfmedia3-types';
import { scopedStorage } from '@/lib/storage';

interface DailyCombinedPanelProps {
  day: number;
  progress: IDayProgress;
  onDaySelect?: (day: number, kind: 'accounting' | 'english' | 'selfmedia') => void;
  onOpenReview?: () => void;
}

interface TaskCardProps {
  icon: typeof Calculator;
  title: string;
  description: string;
  completed: boolean;
  accentColor: string;
  bgColor: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

function TaskCard({
  icon: Icon,
  title,
  description,
  completed,
  accentColor,
  bgColor,
  onClick,
  children,
}: TaskCardProps) {
  return (
    <Card className={`border-border/60 ${completed ? bgColor : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`size-9 rounded-lg flex items-center justify-center ${completed ? bgColor : 'bg-muted'}`}
            >
              <Icon className={`size-5 ${accentColor}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
          {completed && (
            <Badge className="bg-success/15 text-success border-success/20 shrink-0">
              <CheckCircle2 className="size-3 mr-1" />
              已完成
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
        {onClick && (
          <Button variant="outline" size="sm" className="w-full gap-1" onClick={onClick}>
            开始学习
            <ArrowRight className="size-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ScheduleTimeline() {
  const schedule = [
    { time: '08:30', icon: Coffee, title: '会计实务学习', duration: '60分钟', desc: '趁早上脑子清醒，啃硬骨头' },
    { time: '10:30', icon: BookOpen, title: '英语单词 + 阅读', duration: '30分钟', desc: '碎片时间也能学' },
    { time: '15:00', icon: Video, title: '自媒体视频搜集 + 脚本', duration: '30分钟', desc: '下午找灵感，写脚本' },
    { time: '21:00', icon: Moon, title: '英语口语 + 复习', duration: '30分钟', desc: '睡前巩固，效率翻倍' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          每日时间安排建议
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {schedule.map((s, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="size-2.5 rounded-full bg-primary mt-1.5" />
                {i < schedule.length - 1 && (
                  <div className="w-px flex-1 bg-border my-1" />
                )}
              </div>
              <div className="pb-5 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary tabular-nums">{s.time}</span>
                  <span className="text-xs text-muted-foreground">· {s.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <s.icon className="size-4 text-foreground/60" />
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DailyCombinedPanel({ day, progress, onDaySelect, onOpenReview }: DailyCombinedPanelProps) {
  const accountingData = MOCK_ACCOUNTING[day];
  const englishData = MOCK_ENGLISH_DAYS.find((d) => d.day === day);
  const { getReviewCount: getEnglishReviewCount } = useWordLearning();
  const { getDueCount: getAccountingDueCount } = useAccountingReview();
  const smStore = useSelfMediaStore();

  const accountingPreview = accountingData?.knowledgePoints.slice(0, 3) || [];
  const vocabPreview = englishData?.vocab?.slice(0, 4) || englishData?.vocabulary?.slice(0, 4) || [];

  // 英语复习 + 会计复习 + 自媒体复盘
  const englishDue = getEnglishReviewCount();
  const accountingDue = getAccountingDueCount();
  const smPendingData = smStore.publishes.filter(
    (p) => p.status === '已发布' &&
      !smStore.analytics.some((a) => a.publishId === p.id || (p.videoId && a.videoId === p.videoId)),
  ).length;
  const smPendingReview = smStore.analytics.filter(
    (a) => !smStore.reviews.some((r) => r.analyticsId === a.id),
  ).length;
  const selfmediaDue = smPendingData + smPendingReview;
  const totalReviewDue = englishDue + accountingDue + selfmediaDue;
  const dayDate = getDayDate(day);
  const dayDateLabel = `${formatDateCN(dayDate)} 星期${weekdayCN(dayDate)}`;
  const [hotPreview, setHotPreview] = useState<Awaited<ReturnType<typeof fetchHotCandidates>> | null>(null);
  const [hotLoading, setHotLoading] = useState(false);
  const [hotAnalyzingKey, setHotAnalyzingKey] = useState<string | null>(null);
  const [hotGeneratingKey, setHotGeneratingKey] = useState<string | null>(null);
  const [hotAnalyses, setHotAnalyses] = useState<Record<string, ReturnType<typeof normalizeHotAnalysis>>>({});

  const dailyHotKey = useCallback((url: string) => `__sm3_daily_hot_analysis_${smStore.currentAccount}_${smStore.currentStore}_${day}_${encodeURIComponent(url).slice(0, 160)}`, [day, smStore.currentAccount, smStore.currentStore]);

  const hotPreviewDate = new Date();
  hotPreviewDate.setDate(hotPreviewDate.getDate() - 1);
  const hotDateISO = hotPreviewDate.toISOString().slice(0, 10);

  const loadHotPreview = useCallback(async (force = false) => {
    if (hotLoading) return;
    const cacheKey = `__sm3_daily_hot_preview_${smStore.currentAccount}_${smStore.currentStore}_${hotDateISO}`;
    if (!force) {
      try {
        const cached = scopedStorage.getItem(cacheKey);
        if (cached) { setHotPreview(JSON.parse(cached)); return; }
      } catch { /* ignore corrupt cache */ }
    }
    setHotLoading(true);
    try {
      const keywords = [
        '餐饮老板娘', '实体店老板', '餐饮经营', '本地生活', '土菜馆', '餐饮创业',
        smStore.currentAccount === 'bosslady' ? '老板娘IP' : '餐饮门店',
        ...(THIRTY_DAY_PLAN.find((d) => d.day === day)?.dailyTheme ? [THIRTY_DAY_PLAN.find((d) => d.day === day)?.dailyTheme || ''] : []),
      ];
      const result = await fetchHotCandidates(keywords, hotDateISO);
      setHotPreview(result);
      scopedStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (error) {
      if (force) toast.error(error instanceof Error ? error.message : '昨日热门获取失败');
    } finally { setHotLoading(false); }
  }, [hotLoading, hotDateISO, smStore.currentAccount, smStore.currentStore]);

  useEffect(() => { void loadHotPreview(false); }, [loadHotPreview]);

  const analyzeDailyHot = useCallback(async (hot: Awaited<ReturnType<typeof fetchHotCandidates>>['items'][number]) => {
    const key = hot.url || `${hot.platform}-${hot.title}`;
    if (hotAnalyzingKey) return;
    setHotAnalyzingKey(key);
    try {
      const taskPlan = THIRTY_DAY_PLAN.find((d) => d.day === day);
      const task = taskPlan
        ? `Day${day}｜${taskPlan.dailyTheme}｜目标：${taskPlan.dailyGoal}｜选题方向：${taskPlan.topic}｜拍摄：${taskPlan.shootingTask}`
        : `Day${day}`;
      const chars = smStore.getVisibleCharacters().map((c) => `${c.name}｜${c.personality}｜${c.speakingStyle}`).join('\n');
      const prompt = buildHotAnalysisPrompt(hot, task, chars || '暂无人物资料');
      const result = await callAI(prompt, loadAIConfig());
      const analysis = normalizeHotAnalysis(extractJSON<Record<string, unknown>>(result.content));
      setHotAnalyses((prev) => ({ ...prev, [key]: analysis }));
      try { scopedStorage.setItem(dailyHotKey(key), JSON.stringify(analysis)); } catch { /* cache failure does not block result */ }
      toast.success(`TOP案例${hot.platform}：AI拆解完成`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI热门拆解失败');
    } finally {
      setHotAnalyzingKey(null);
    }
  }, [dailyHotKey, day, hotAnalyzingKey, smStore]);

  const generateFromDailyHot = useCallback(async (hot: Awaited<ReturnType<typeof fetchHotCandidates>>['items'][number]) => {
    const key = hot.url || `${hot.platform}-${hot.title}`;
    const analysis = hotAnalyses[key];
    if (!analysis || hotGeneratingKey) return;
    setHotGeneratingKey(key);
    try {
      const taskPlan = THIRTY_DAY_PLAN.find((d) => d.day === day);
      const topicResult = await callAI(`请把下面热门案例的可迁移结构改造成我的原创餐饮老板娘账号Day${day}选题。不得照抄标题、台词或具体表达，不得编造事实。\n\n【案例】${hot.title}\n【平台】${hot.platform}\n【AI拆解】${JSON.stringify(analysis)}\n【今日任务】${taskPlan?.dailyTheme || ''}｜${taskPlan?.dailyGoal || ''}\n【账号】${smStore.currentAccount}｜【门店】${smStore.currentStore}\n请只返回JSON：{"title":"","riskLevel":"测试型","targetUser":"","painPoint":"","contentType":"老板娘口播","coreOpinion":"","recommendedStore":"","recommendedPerson":"老板娘","recommendedDish":"","hook":"","structure":"","cta":"","reason":"","risk":"","factsToConfirm":"","involvesCustomer":false,"estimatedDuration":"45秒","shootingDifficulty":"中等"}`, loadAIConfig());
      const t = extractJSON<Record<string, unknown>>(topicResult.content);
      const topic = smStore.addTopic({
        day, title: String(t.title || `Day${day}热门案例原创改造`),
        riskLevel: (t.riskLevel || '测试型') as TopicRiskLevel, targetUser: String(t.targetUser || ''),
        painPoint: String(t.painPoint || ''), contentType: (t.contentType || '老板娘口播') as ContentType,
        coreOpinion: String(t.coreOpinion || ''), recommendedStore: String(t.recommendedStore || ''),
        recommendedPerson: String(t.recommendedPerson || '老板娘'), recommendedDish: String(t.recommendedDish || ''),
        hook: String(t.hook || ''), structure: String(t.structure || ''), cta: String(t.cta || ''),
        reason: `参考${hot.platform}昨日案例《${hot.title}》，仅迁移内容结构后原创改造`, risk: String(t.risk || ''),
        factsToConfirm: String(t.factsToConfirm || ''), involvesCustomer: Boolean(t.involvesCustomer),
        estimatedDuration: String(t.estimatedDuration || '45秒'), shootingDifficulty: (t.shootingDifficulty || '中等') as '简单' | '中等' | '较难',
        status: '待采用', createdAt: Date.now(),
      });
      const scriptResult = await callAI(buildScriptPrompt(smStore, topic, day) + `\n\n【热门案例改造约束】参考案例只能提供结构启发，不得照抄。必须适配老板娘真实餐饮场景，不拍顾客，不虚构销量/评价/价格。只返回JSON：{"title":"","targetUser":"","goal":"","person":"老板娘","dish":"","estimatedDuration":"45-60秒","contentType":"老板娘口播","shootingOrder":"","requiredShots":"","optionalShots":"","missingMaterials":"","shots":[{"shotNumber":1,"time":"0-3s","shotSize":"近景","visual":"","action":"","dialogue":"","subtitle":"","sound":"","shootingNote":"","editingNote":"","isRequired":true}]}，至少8个镜头。`, loadAIConfig());
      const raw = extractJSON<Record<string, unknown>>(scriptResult.content);
      const rawShots = Array.isArray(raw.shots) ? raw.shots : [];
      if (rawShots.length < 8) throw new Error('AI返回的完整脚本少于8个镜头，请重试');
      const shots: Shot[] = rawShots.map((item, index) => {
        const x = (item || {}) as Record<string, unknown>;
        return { shotNumber: index + 1, time: String(x.time || ''), shotSize: String(x.shotSize || '中景'), visual: String(x.visual || ''),
          action: String(x.action || ''), dialogue: String(x.dialogue || ''), subtitle: String(x.subtitle || ''), sound: String(x.sound || ''),
          shootingNote: String(x.shootingNote || ''), editingNote: String(x.editingNote || ''), isRequired: x.isRequired !== false, status: '未拍' };
      });
      const script = smStore.addScript({
        day, topicId: topic.id, sourceTopicId: topic.id, title: String(raw.title || topic.title),
        targetUser: String(raw.targetUser || topic.targetUser), goal: String(raw.goal || taskPlan?.dailyGoal || '完成今日内容'),
        person: String(raw.person || topic.recommendedPerson || '老板娘'), dish: String(raw.dish || topic.recommendedDish || ''),
        estimatedDuration: String(raw.estimatedDuration || topic.estimatedDuration || '45-60秒'), contentType: (raw.contentType || topic.contentType) as ContentType,
        shots, requiredMediaIds: [], shootingOrder: String(raw.shootingOrder || '按镜头顺序拍摄'), requiredShots: String(raw.requiredShots || '前8个镜头全部必拍'),
        optionalShots: String(raw.optionalShots || ''), missingMaterials: String(raw.missingMaterials || ''), status: '草稿', createdAt: Date.now(), updatedAt: Date.now(),
      });
      smStore.updateTopic(topic.id, { status: '已生成脚本' });
      smStore.setWarRoomTask(day, 'topic', true);
      smStore.setWarRoomTask(day, 'script', true);
      toast.success(`已生成Day${day}原创选题+${script.shots.length}镜头完整脚本`);
      onDaySelect?.(day, 'selfmedia');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '原创脚本生成失败');
    } finally {
      setHotGeneratingKey(null);
    }
  }, [day, hotAnalyses, hotGeneratingKey, onDaySelect, smStore]);

  const hotTop3 = useMemo(() => {
    const items = hotPreview?.items || [];
    return [...items]
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
      .slice(0, 3);
  }, [hotPreview]);

  useEffect(() => {
    const next: Record<string, ReturnType<typeof normalizeHotAnalysis>> = {};
    for (const hot of hotTop3) {
      const key = hot.url || `${hot.platform}-${hot.title}`;
      try {
        const cached = scopedStorage.getItem(dailyHotKey(key));
        if (cached) next[key] = JSON.parse(cached);
      } catch { /* ignore corrupt cache */ }
    }
    setHotAnalyses(next);
  }, [hotTop3, dailyHotKey]);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-accent/30 to-background border border-primary/10"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              第 {day} 天 · {dayDateLabel}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              每天进步一点点，30天后你会感谢现在的自己
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                会计：{accountingPreview.length}个知识点
              </Badge>
              <Badge variant="secondary" className="text-xs">
                英语：{vocabPreview.length}个单词
              </Badge>
              <Badge variant="secondary" className="text-xs">
                自媒体：30分钟
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <Card className="border-primary/15 bg-primary/5">
        <CardHeader className="pb-2.5">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="size-4 text-primary" />
              昨日热门 · 今日参考
            </CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => void loadHotPreview(true)} disabled={hotLoading}>
              <RefreshCw className={`size-3 mr-1 ${hotLoading ? 'animate-spin' : ''}`} />
              {hotLoading ? '获取中…' : '刷新热门'}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">根据昨日公开联网候选，优先选择与第{day}天“{THIRTY_DAY_PLAN.find((d) => d.day === day)?.dailyTheme || '今日任务'}”相关的内容。没有真实平台热度数据时不虚构。</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {hotTop3.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              {hotLoading ? '正在获取昨日热门候选…' : '暂时没有昨日热门候选。可点“刷新热门”重试，或进入热门案例库手动添加。'}
            </div>
          ) : hotTop3.map((h, index) => (
            <div key={`${h.platform}-${h.url}`} className="rounded-lg border bg-background p-3">
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0 text-[10px]">TOP {index + 1}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{h.platform}</Badge>
                    <span className="text-[10px] text-muted-foreground">{h.account || '账号未知'}</span>
                  </div>
                  <p className="text-xs font-medium mt-1 line-clamp-2">{h.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{h.metrics || '热度未提供；需回原平台核验'}</p>
                  <div className="flex gap-1.5 mt-2">
                    {h.url && <a href={h.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded border px-2 py-1 text-[10px] hover:bg-muted"><ExternalLink className="size-3 mr-1" />查看原文</a>}
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => onDaySelect?.(day, 'selfmedia')}><Sparkles className="size-3 mr-1" />进入今日作战台</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => void analyzeDailyHot(h)} disabled={hotAnalyzingKey === (h.url || `${h.platform}-${h.title}`)}>
                      {hotAnalyzingKey === (h.url || `${h.platform}-${h.title}`) ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Sparkles className="size-3 mr-1" />}
                      {hotAnalyzingKey === (h.url || `${h.platform}-${h.title}`) ? 'AI拆解中' : 'AI拆解'}
                    </Button>
                    {hotAnalyses[h.url || `${h.platform}-${h.title}`] && (
                      <Button size="sm" className="h-6 px-2 text-[10px]" onClick={() => void generateFromDailyHot(h)} disabled={hotGeneratingKey === (h.url || `${h.platform}-${h.title}`)}>
                        {hotGeneratingKey === (h.url || `${h.platform}-${h.title}`) ? <Loader2 className="size-3 mr-1 animate-spin" /> : <CheckCircle2Icon className="size-3 mr-1" />}
                        {hotGeneratingKey === (h.url || `${h.platform}-${h.title}`) ? '生成中' : '生成我的今日脚本'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground/70">昨日日期：{hotPreview?.date || hotDateISO} · 联网搜索候选，不等同官方热榜。</p>
        </CardContent>
      </Card>

      <ScheduleTimeline />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
          <Sunset className="size-4 text-primary" />
          今日学习任务
        </h3>

        <TaskCard
          icon={Calculator}
          title="会计实操"
          description={accountingData?.task || `第${day}天学习任务`}
          completed={progress.accounting}
          accentColor="text-primary"
          bgColor="bg-primary/5"
          onClick={() => onDaySelect?.(day, 'accounting')}
        >
          <ul className="space-y-1.5 text-sm">
            {accountingPreview.map((kp, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/80">
                <span className="text-xs text-primary mt-0.5">•</span>
                <span className="line-clamp-1">{kp}</span>
              </li>
            ))}
          </ul>
        </TaskCard>

        <TaskCard
          icon={Languages}
          title="英语学习"
          description={englishData?.theme || '每日英语进阶'}
          completed={progress.english}
          accentColor="text-info"
          bgColor="bg-info/5"
          onClick={() => onDaySelect?.(day, 'english')}
        >
          <div className="grid grid-cols-2 gap-2">
            {vocabPreview.map((v, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium text-foreground">{v.word}</span>
                <span className="text-muted-foreground ml-1.5">{v.meaning.split('；')[0]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-border/40">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Headphones className="size-3.5" />
              听力阅读
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="size-3.5" />
              口语练习
            </div>
          </div>
        </TaskCard>

        <TaskCard
          icon={Video}
          title="自媒体运营"
          description="今日作战台 + 选题/脚本/发布"
          completed={progress.selfmedia}
          accentColor="text-success"
          bgColor="bg-success/5"
          onClick={() => onDaySelect?.(day, 'selfmedia')}
        >
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-md bg-muted/50">
              <p className="font-medium text-foreground">10分钟</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">搜集热门</p>
            </div>
            <div className="p-2 rounded-md bg-muted/50">
              <p className="font-medium text-foreground">10分钟</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">拆解分析</p>
            </div>
            <div className="p-2 rounded-md bg-muted/50">
              <p className="font-medium text-foreground">10分钟</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">写脚本</p>
            </div>
          </div>
        </TaskCard>

        {/* 复习中心入口 */}
        <Card className="border-border/60 bg-gradient-to-r from-primary/5 to-accent/20">
          <CardContent className="p-4">
            <button
              onClick={onOpenReview}
              className="w-full flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="size-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">复习中心</p>
                  <p className="text-xs text-muted-foreground">
                    {totalReviewDue > 0
                      ? `今日待处理 ${totalReviewDue} 项`
                      : '温故知新，巩固已学内容'}
                  </p>
                  {totalReviewDue > 0 && (
                    <div className="flex gap-2 mt-1">
                      {englishDue > 0 && (
                        <span className="text-[10px] text-primary">英语复习 {englishDue}</span>
                      )}
                      {accountingDue > 0 && (
                        <span className="text-[10px] text-info">会计复习 {accountingDue}</span>
                      )}
                      {selfmediaDue > 0 && (
                        <span className="text-[10px] text-success">自媒体复盘 {selfmediaDue}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {totalReviewDue > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs">{totalReviewDue}</Badge>
                )}
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
