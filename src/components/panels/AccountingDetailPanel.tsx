import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Lightbulb, Play, ClipboardList, Hammer, ChevronLeft, ChevronRight, CheckCircle2, Copy, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { MOCK_ACCOUNTING } from '@/data/accounting';
import { MOCK_ACCOUNTING_ANSWERS } from '@/data/accountingAnswers';
import { formatDayLabelCN } from '@/lib/studyDate';
import { toast } from 'sonner';

interface AccountingDetailPanelProps {
  day: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onDayChange: (day: number) => void;
}

export default function AccountingDetailPanel({ day, isCompleted, onToggleComplete, onDayChange }: AccountingDetailPanelProps) {
  const data = MOCK_ACCOUNTING[day];
  const answers = MOCK_ACCOUNTING_ANSWERS[day];
  const [showHomeworkAnswers, setShowHomeworkAnswers] = useState(false);
  const [showPracticalAnswers, setShowPracticalAnswers] = useState(false);

  if (!data) return <Card><CardContent className="py-12 text-center text-muted-foreground">暂无第{day}天数据</CardContent></Card>;

  // 兼容旧答案数据：历史版本使用 homeworkAnswer/practiceAnswer 字符串，新版本使用数组。
  // 不修改原数据结构、不修改任何 localStorage key，只在展示层统一成数组。
  const homeworkAnswers = answers?.homeworkAnswers?.length
    ? answers.homeworkAnswers
    : answers?.homeworkAnswer
      ? answers.homeworkAnswer.split(/\n(?=\d+[.、])/).map((x) => x.trim()).filter(Boolean)
      : [];
  const practicalAnswers = answers?.practicalWorkAnswers?.length
    ? answers.practicalWorkAnswers
    : answers?.practiceAnswer
      ? answers.practiceAnswer.split(/\n(?=\d+[.、])/).map((x) => x.trim()).filter(Boolean)
      : [];

  const copyText = (text: string) => navigator.clipboard.writeText(text).then(() => toast.success(`已复制：${text}`));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">第{day}天 / 30天</Badge>
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">{formatDayLabelCN(day)}</Badge>
          <Badge variant="secondary" className="text-xs">{data.stage}</Badge>
          {isCompleted && <Badge className="bg-success/15 text-success border-success/20"><CheckCircle2 className="size-3 mr-1" />已完成</Badge>}
        </div>
        <Button size="sm" variant={isCompleted ? 'outline' : 'default'} onClick={onToggleComplete} className="gap-1.5">
          {isCompleted ? <><EyeOff className="size-4" />标记未完成</> : <><CheckCircle2 className="size-4" />标记已完成</>}
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="size-5 text-primary" />今日学习任务</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-foreground/90 leading-relaxed">{data.task}</p></CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="size-5 text-foreground/70" />知识点清单</CardTitle></CardHeader>
        <CardContent><ol className="space-y-2.5 list-decimal list-inside text-sm text-foreground/85">{data.knowledgePoints.map((kp, i) => <li key={i} className="leading-relaxed pl-1">{kp}</li>)}</ol></CardContent>
      </Card>

      {data.videos?.length ? <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Play className="size-5 text-foreground/70" />学习视频推荐</CardTitle></CardHeader>
        <CardContent className="space-y-3">{data.videos.map((v, i) => <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{v.title}</p><p className="text-xs text-muted-foreground mt-0.5">UP主：{v.uploader}</p></div>{v.bvNumber ? <Button variant="outline" size="sm" onClick={() => copyText(v.bvNumber!)} className="shrink-0 gap-1.5 h-8"><Copy className="size-3.5" />{v.bvNumber}</Button> : v.searchKeyword ? <Button variant="outline" size="sm" onClick={() => copyText(v.searchKeyword!)} className="shrink-0 gap-1.5 h-8"><ExternalLink className="size-3.5" />搜索</Button> : null}</div>)}</CardContent>
      </Card> : null}

      {data.homework.length > 0 && <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="size-5 text-foreground/70" />课后作业</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2.5 list-decimal list-inside text-sm text-foreground/85">{data.homework.map((hw, i) => <li key={i} className="leading-relaxed pl-1">{hw}</li>)}</ol>
          {homeworkAnswers.length > 0 && <AnswerBlock answers={homeworkAnswers} open={showHomeworkAnswers} onToggle={() => setShowHomeworkAnswers(v => !v)} tone="primary" title="参考答案（做完再看）" />}
        </CardContent>
      </Card>}

      {data.practicalWork.length > 0 && <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Hammer className="size-5 text-warning" />实操作业</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2.5 list-decimal list-inside text-sm text-foreground/90">{data.practicalWork.map((pw, i) => <li key={i} className="leading-relaxed pl-1">{pw}</li>)}</ol>
          {practicalAnswers.length > 0 && <AnswerBlock answers={practicalAnswers} open={showPracticalAnswers} onToggle={() => setShowPracticalAnswers(v => !v)} tone="warning" title="实操参考（动手尝试后再看）" />}
        </CardContent>
      </Card>}

      <div className="flex items-center justify-between pt-2"><Button variant="outline" onClick={() => onDayChange(day - 1)} disabled={day <= 1} size="sm"><ChevronLeft className="size-4 mr-1" />上一天</Button><span className="text-xs text-muted-foreground">第{day}天 / 共30天</span><Button variant="outline" onClick={() => onDayChange(day + 1)} disabled={day >= 30} size="sm">下一天<ChevronRight className="size-4 ml-1" /></Button></div>
    </motion.div>
  );
}

function AnswerBlock({ answers, open, onToggle, tone, title }: { answers: string[]; open: boolean; onToggle: () => void; tone: 'primary' | 'warning'; title: string }) {
  const isWarning = tone === 'warning';
  return <div className={`pt-3 border-t ${isWarning ? 'border-warning/20' : 'border-border/40'}`}>
    <Button variant="outline" size="sm" onClick={onToggle} className="w-full justify-center">{open ? <><EyeOff className="size-4 mr-1.5" />隐藏参考答案</> : <><Eye className="size-4 mr-1.5" />显示参考答案</>}</Button>
    <AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><div className="mt-4 space-y-3"><div className={`flex items-center gap-2 text-xs font-medium ${isWarning ? 'text-warning' : 'text-primary'}`}><Lightbulb className="size-3.5" />{title}</div><ol className={`space-y-2.5 list-decimal list-inside text-sm text-foreground/85 rounded-lg p-3.5 border ${isWarning ? 'bg-warning/10 border-warning/20' : 'bg-primary/5 border-primary/10'}`}>{answers.map((ans, i) => <li key={i} className="leading-relaxed pl-1 whitespace-pre-line">{ans}</li>)}</ol></div></motion.div>}</AnimatePresence>
  </div>;
}
