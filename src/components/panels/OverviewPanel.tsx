import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  TrendingUp,
  Coffee,
  BookOpen,
  Video,
  Moon,
  Clock,
  Check,
  Circle,
  RotateCcw,
  BarChart3,
} from 'lucide-react';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OverviewPanelProps {
  tab: 'schedule' | 'checkin';
  onDaySelect?: (day: number) => void;
}

function SchedulePanel() {
  const schedule = [
    {
      time: '08:30 - 09:30',
      icon: Coffee,
      title: '会计实务学习',
      duration: '60分钟',
      desc: '趁早上脑子清醒，啃会计硬骨头。知识点学习 + 视频听课 + 课后作业。',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      time: '10:30 - 11:00',
      icon: BookOpen,
      title: '英语单词 + 阅读',
      duration: '30分钟',
      desc: '店里不忙的空档，背单词 + 读一小段英文材料，保持语感。',
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      time: '15:00 - 15:30',
      icon: Video,
      title: '自媒体视频搜集 + 脚本',
      duration: '30分钟',
      desc: '下午刷热门视频找灵感，拆解爆款，写一条拍摄脚本。',
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      time: '21:00 - 21:30',
      icon: Moon,
      title: '英语口语 + 复习',
      duration: '30分钟',
      desc: '晚上安静时段，口语练习 + 复习当天单词和知识点。',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/30 to-background">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            每日学习时间安排
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80 leading-relaxed">
            结合你在徽菜馆的工作节奏，把学习拆成 4 个时段，利用早上、空闲和晚上的时间。
            每天累计学习约 2.5 小时，既能推进进度又不会太累。
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {schedule.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`size-12 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                    <s.icon className={`size-5 ${s.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          <Clock className="size-3 mr-1" />
                          {s.time}
                        </Badge>
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {s.duration}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-warning/20 bg-warning/[0.02]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="size-4 text-warning" />
            温馨提示
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
            <li>忙的时候不要硬学，质量比数量重要，宁可少学一点也不要糊弄</li>
            <li>如果某天实在太累，允许自己只完成 1-2 项，第二天再补</li>
            <li>每完成一周给自己一个小奖励，比如吃一顿好吃的、买件喜欢的东西</li>
            <li>学习是为了让自己更好，不是为了完任务，享受成长的过程 💪</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CheckinPanel({ onDaySelect }: { onDaySelect?: (day: number) => void }) {
  const { progress, toggleTask, stats, completedDays, resetAll } = useStudyProgress();
  const [showReset, setShowReset] = useState(false);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const percent = {
    accounting: Math.round((stats.accounting / 30) * 100),
    english: Math.round((stats.english / 30) * 100),
    selfmedia: Math.round((stats.selfmedia / 30) * 100),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">会计</div>
            <div className="text-xl font-bold text-primary tabular-nums">
              {stats.accounting}
              <span className="text-xs font-normal text-muted-foreground ml-1">/30</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${percent.accounting}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">{percent.accounting}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">英语</div>
            <div className="text-xl font-bold text-info tabular-nums">
              {stats.english}
              <span className="text-xs font-normal text-muted-foreground ml-1">/30</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-info rounded-full transition-all duration-500"
                style={{ width: `${percent.english}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">{percent.english}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">自媒体</div>
            <div className="text-xl font-bold text-success tabular-nums">
              {stats.selfmedia}
              <span className="text-xs font-normal text-muted-foreground ml-1">/30</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-500"
                style={{ width: `${percent.selfmedia}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">{percent.selfmedia}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="size-5 text-foreground/70" />
            30天学习进度打卡表
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            全三项完成：{completedDays}/30 天 · 点击圆圈切换完成状态
          </p>
        </div>
        <AlertDialog open={showReset} onOpenChange={setShowReset}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RotateCcw className="size-3.5" />
              重置进度
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确定重置所有进度？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将清空 30 天的所有打卡记录，不可恢复。
                建议先截图保存你的学习成果再重置。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetAll();
                  setShowReset(false);
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                确认重置
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap text-center w-24">天数</TableHead>
                  <TableHead className="whitespace-nowrap text-center w-24">会计</TableHead>
                  <TableHead className="whitespace-nowrap text-center w-24">英语</TableHead>
                  <TableHead className="whitespace-nowrap text-center w-24">自媒体</TableHead>
                  <TableHead className="whitespace-nowrap text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map((day) => {
                  const dp = progress[day];
                  return (
                    <TableRow key={day}>
                      <TableCell className="text-center font-medium">第{day}天</TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleTask(day, 'accounting')}
                          className="inline-flex items-center justify-center"
                          aria-label={`第${day}天会计${dp.accounting ? '已完成' : '未完成'}`}
                        >
                          {dp.accounting ? (
                            <Check className="size-5 text-primary" />
                          ) : (
                            <Circle className="size-5 text-border hover:text-muted-foreground transition-colors" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleTask(day, 'english')}
                          className="inline-flex items-center justify-center"
                          aria-label={`第${day}天英语${dp.english ? '已完成' : '未完成'}`}
                        >
                          {dp.english ? (
                            <Check className="size-5 text-info" />
                          ) : (
                            <Circle className="size-5 text-border hover:text-muted-foreground transition-colors" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleTask(day, 'selfmedia')}
                          className="inline-flex items-center justify-center"
                          aria-label={`第${day}天自媒体${dp.selfmedia ? '已完成' : '未完成'}`}
                        >
                          {dp.selfmedia ? (
                            <Check className="size-5 text-success" />
                          ) : (
                            <Circle className="size-5 text-border hover:text-muted-foreground transition-colors" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onDaySelect?.(day)}
                        >
                          <TrendingUp className="size-3 mr-1" />
                          前往学习
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function OverviewPanel({ tab, onDaySelect }: OverviewPanelProps) {
  if (tab === 'schedule') {
    return <SchedulePanel />;
  }
  return <CheckinPanel onDaySelect={onDaySelect} />;
}
