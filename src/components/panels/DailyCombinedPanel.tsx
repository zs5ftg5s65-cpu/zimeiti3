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
} from 'lucide-react';
import type { IDayProgress } from '@/hooks/useStudyProgress';
import { MOCK_ACCOUNTING } from '@/data/accounting';
import { MOCK_ENGLISH_DAYS } from '@/data/english';

interface DailyCombinedPanelProps {
  day: number;
  progress: IDayProgress;
  onDaySelect?: (day: number, kind: 'accounting' | 'english') => void;
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

export default function DailyCombinedPanel({ day, progress, onDaySelect }: DailyCombinedPanelProps) {
  const accountingData = MOCK_ACCOUNTING[day];
  const englishData = MOCK_ENGLISH_DAYS.find((d) => d.day === day);

  const accountingPreview = accountingData?.knowledgePoints.slice(0, 3) || [];
  const vocabPreview = englishData?.vocabulary?.slice(0, 4) || [];

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
              今天是第 {day} 天，继续加油 ✨
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
          description="30分钟：搜集热门视频 + 拆解 + 写脚本"
          completed={progress.selfmedia}
          accentColor="text-success"
          bgColor="bg-success/5"
          onClick={() => {
            const event = new CustomEvent('navigate-selfmedia');
            window.dispatchEvent(event);
          }}
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
      </div>
    </div>
  );
}
