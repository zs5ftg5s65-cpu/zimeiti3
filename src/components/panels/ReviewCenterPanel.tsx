import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Calculator, TrendingUp, ChevronRight, Play, CheckCircle2,
  Clock, AlertCircle, Award, BarChart3, FileText,
} from 'lucide-react';
import { useWordLearning } from '@/hooks/useWordLearning';
import { useAccountingReview } from '@/hooks/useAccountingReview';
import { useSelfMediaStore } from '@/hooks/useSelfMediaStore';
import { MOCK_ENGLISH_DAYS } from '@/data/english';
import ReviewWordModal from './ReviewWordModal';
import ReviewAccountingModal from './ReviewAccountingModal';
import type { WordMastery } from '@/hooks/useWordLearning';
import type { AccountingMastery } from '@/hooks/useAccountingReview';

interface ReviewCenterPanelProps {
  currentDay: number;
  onNavigate: (kind: 'accounting' | 'english' | 'selfmedia', day?: number, tab?: string) => void;
}

export default function ReviewCenterPanel({ currentDay, onNavigate }: ReviewCenterPanelProps) {
  const { getDueWords, studyWord } = useWordLearning();
  const { getDuePoints, reviewPoint } = useAccountingReview();
  const smStore = useSelfMediaStore();

  const [englishReviewOpen, setEnglishReviewOpen] = useState(false);
  const [accountingReviewOpen, setAccountingReviewOpen] = useState(false);

  // 英语：今日到期复习单词
  const dueWords = useMemo(() => getDueWords(), [getDueWords]);

  // 会计：今日到期复习知识点
  const duePoints = useMemo(() => getDuePoints(), [getDuePoints]);

  // 自媒体复盘数据（基于真实数据计算，账号门店已隔离）
  const selfmediaReview = useMemo(() => {
    const published = smStore.publishes.filter((p) => p.status === '已发布');
    const analyticsPublishIds = new Set(smStore.analytics.map((a) => a.publishId));
    const analyticsVideoIds = new Set(smStore.analytics.map((a) => a.videoId).filter(Boolean));
    // 待录入数据：已发布但没有对应 analytics
    const pendingData = published.filter(
      (p) => !analyticsPublishIds.has(p.id) && !(p.videoId && analyticsVideoIds.has(p.videoId)),
    );
    // 待复盘：有 analytics 但没有对应 review
    const reviewAnalyticsIds = new Set(smStore.reviews.map((r) => r.analyticsId));
    const pendingReview = smStore.analytics.filter((a) => !reviewAnalyticsIds.has(a.id));
    return {
      pendingData: pendingData.length,
      pendingReview: pendingReview.length,
      completedReviews: smStore.reviews.length,
      templates: smStore.templates.length,
    };
  }, [smStore.publishes, smStore.analytics, smStore.reviews, smStore.templates]);

  const totalDue = dueWords.length + duePoints.length + selfmediaReview.pendingData + selfmediaReview.pendingReview;

  const handleEnglishReview = (day: number, word: string, mastery: WordMastery) => {
    studyWord(day, word, mastery);
  };

  const handleAccountingReview = (id: string, mastery: AccountingMastery) => {
    reviewPoint(id, mastery);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 顶部标题 */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">复习中心</h1>
        <p className="text-sm text-muted-foreground mt-1">
          今日待处理 <span className="font-bold text-primary">{totalDue}</span> 项
        </p>
      </div>

      {/* 今日总览卡片 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4 text-center">
            <BookOpen className="size-5 text-primary mx-auto mb-1" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">{dueWords.length}</div>
            <div className="text-xs text-muted-foreground">英语复习</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4 text-center">
            <Calculator className="size-5 text-info mx-auto mb-1" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">{duePoints.length}</div>
            <div className="text-xs text-muted-foreground">会计复习</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4 text-center">
            <TrendingUp className="size-5 text-success mx-auto mb-1" />
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {selfmediaReview.pendingData + selfmediaReview.pendingReview}
            </div>
            <div className="text-xs text-muted-foreground">自媒体复盘</div>
          </CardContent>
        </Card>
      </div>

      {/* ============ 英语复习 ============ */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">英语复习</h3>
                <p className="text-xs text-muted-foreground">间隔复习 · 不熟优先</p>
              </div>
            </div>
            <Badge variant={dueWords.length > 0 ? 'default' : 'secondary'}>
              {dueWords.length > 0 ? `${dueWords.length} 个待复习` : '已完成'}
            </Badge>
          </div>

          {dueWords.length > 0 ? (
            <>
              <div className="space-y-1.5 mb-4 max-h-[200px] overflow-y-auto">
                {dueWords.slice(0, 5).map((r) => {
                  const dayData = MOCK_ENGLISH_DAYS.find((d) => d.day === r.day);
                  const words = dayData?.vocab || dayData?.vocabulary || [];
                  const w = words.find((w) => w.word.toLowerCase() === r.word.toLowerCase());
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground">{r.word}</span>
                        {w && <span className="text-xs text-muted-foreground ml-2">{w.meaning}</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">Day {r.day}</Badge>
                        {r.mastery === 'learning' && (
                          <Badge className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                            不熟
                          </Badge>
                        )}
                        {r.mastery === 'mastered' && (
                          <Badge className="text-[10px] bg-success/10 text-success border-success/20">
                            长期
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                {dueWords.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    还有 {dueWords.length - 5} 个，开始复习后逐个出现
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => setEnglishReviewOpen(true)}
                >
                  <Play className="size-4 mr-1.5" />
                  开始英语复习
                </Button>
                <Button variant="outline" onClick={() => onNavigate('english', currentDay)}>
                  去学习
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="size-10 text-success/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">今天没有到期的英语单词</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => onNavigate('english', currentDay)}>
                去学习新单词
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============ 会计复习 ============ */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-info/10 flex items-center justify-center">
                <Calculator className="size-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">会计复习</h3>
                <p className="text-xs text-muted-foreground">完成学习后自动生成复习计划</p>
              </div>
            </div>
            <Badge variant={duePoints.length > 0 ? 'default' : 'secondary'}>
              {duePoints.length > 0 ? `${duePoints.length} 个待复习` : '已完成'}
            </Badge>
          </div>

          {duePoints.length > 0 ? (
            <>
              <div className="space-y-1.5 mb-4 max-h-[200px] overflow-y-auto">
                {duePoints.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                  >
                    <span className="text-sm text-foreground truncate flex-1 mr-2">
                      {r.knowledgePoint}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px]">Day {r.day}</Badge>
                      {r.mastery === 'learning' && (
                        <Badge className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                          不熟
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {duePoints.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    还有 {duePoints.length - 5} 个知识点
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-info hover:bg-info/90"
                  onClick={() => setAccountingReviewOpen(true)}
                >
                  <Play className="size-4 mr-1.5" />
                  开始会计复习
                </Button>
                <Button variant="outline" onClick={() => onNavigate('accounting', currentDay)}>
                  去学习
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="size-10 text-success/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">今天没有到期的会计知识点</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => onNavigate('accounting', currentDay)}>
                去学习会计
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============ 自媒体复盘 ============ */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">自媒体复盘</h3>
                <p className="text-xs text-muted-foreground">发布 → 数据 → 复盘 → 模板</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => onNavigate('selfmedia', undefined, 'analytics')}
              className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20 text-left hover:bg-warning/10 transition-colors"
            >
              <BarChart3 className="size-5 text-warning shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-bold text-foreground">{selfmediaReview.pendingData}</div>
                <div className="text-xs text-muted-foreground">待录入数据</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('selfmedia', undefined, 'review')}
              className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-left hover:bg-destructive/10 transition-colors"
            >
              <AlertCircle className="size-5 text-destructive shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-bold text-foreground">{selfmediaReview.pendingReview}</div>
                <div className="text-xs text-muted-foreground">待复盘视频</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('selfmedia', undefined, 'review')}
              className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20 text-left hover:bg-success/10 transition-colors"
            >
              <FileText className="size-5 text-success shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-bold text-foreground">{selfmediaReview.completedReviews}</div>
                <div className="text-xs text-muted-foreground">已完成复盘</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('selfmedia', undefined, 'templates')}
              className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-left hover:bg-primary/10 transition-colors"
            >
              <Award className="size-5 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-bold text-foreground">{selfmediaReview.templates}</div>
                <div className="text-xs text-muted-foreground">成功模板</div>
              </div>
            </button>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => onNavigate('selfmedia')}
          >
            进入自媒体工作台
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* 复习说明 */}
      <Card className="border-border/40 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Clock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong className="text-foreground/70">学习</strong>：今天第一次学习新内容。</p>
              <p><strong className="text-foreground/70">复习</strong>：过去学过、到了复习时间的内容（1天→3天→7天→14天→30天）。</p>
              <p><strong className="text-foreground/70">复盘</strong>：自媒体视频发布后的数据分析与总结。</p>
              <p className="mt-1">Day 与复习日期独立：当前是第 {currentDay} 天，但更早学过的内容到期后也会出现在这里。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 复习弹窗 */}
      <ReviewWordModal
        open={englishReviewOpen}
        onClose={() => setEnglishReviewOpen(false)}
        dueRecords={dueWords}
        onReview={handleEnglishReview}
      />
      <ReviewAccountingModal
        open={accountingReviewOpen}
        onClose={() => setAccountingReviewOpen(false)}
        dueRecords={duePoints}
        onReview={handleAccountingReview}
      />
    </div>
  );
}
