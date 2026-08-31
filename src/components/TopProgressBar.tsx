import { useState } from 'react';
import { Check, Circle, CalendarDays, ChevronDown, Sparkles, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { IDayProgress } from '@/hooks/useStudyProgress';
import { getDayDate, formatDateCN, weekdayCN, getTodayDay } from '@/lib/studyDate';

interface TopProgressBarProps {
  currentDay: number;
  todayProgress: IDayProgress;
  onMarkComplete: (tasks: Partial<IDayProgress>) => void;
  totalStats: { accounting: number; english: number; selfmedia: number };
  /** 点击"回到今天"时回调；不传则不显示该按钮 */
  onGoToday?: (todayDay: number) => void;
}

export default function TopProgressBar({
  currentDay,
  todayProgress,
  onMarkComplete,
  totalStats,
  onGoToday,
}: TopProgressBarProps) {
  // 日期来自"开始日期 + Day"，不再用 new Date() 写死，切换 Day 时日期一起变（本地时区）
  const dayDate = getDayDate(currentDay);
  const dateStr = formatDateCN(dayDate);
  const weekday = weekdayCN(dayDate);
  const todayDay = getTodayDay();
  const isToday = todayDay != null && todayDay === currentDay;

  const percent = Math.round(
    ((todayProgress.accounting ? 1 : 0) + (todayProgress.english ? 1 : 0) + (todayProgress.selfmedia ? 1 : 0)) / 3 * 100,
  );

  const [tempTasks, setTempTasks] = useState({
    accounting: todayProgress.accounting,
    english: todayProgress.english,
    selfmedia: todayProgress.selfmedia,
  });

  const taskLabels = [
    { key: 'accounting' as const, label: '会计实操', color: 'text-primary' },
    { key: 'english' as const, label: '英语学习', color: 'text-info' },
    { key: 'selfmedia' as const, label: '自媒体运营', color: 'text-success' },
  ];

  return (
    <div className="w-full bg-card border-b border-border/60">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg font-bold text-foreground">
                第 {currentDay} 天
                <span className="text-sm font-normal text-muted-foreground ml-1">/ 30天</span>
              </h1>
              <Badge variant="secondary" className="text-[11px] font-normal">
                今日进度 {percent}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {dateStr} 星期{weekday}
              </span>
              {isToday && <span className="text-primary">· 今天</span>}
              {!isToday && todayDay != null && onGoToday && (
                <button
                  type="button"
                  onClick={() => onGoToday(todayDay)}
                  className="inline-flex items-center gap-1 text-info hover:underline"
                >
                  <CalendarClock className="size-3.5" />
                  回到今天(Day{todayDay})
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {taskLabels.map((t) => (
            <div
              key={t.key}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 text-xs"
            >
              {todayProgress[t.key] ? (
                <Check className={`size-3.5 ${t.color}`} />
              ) : (
                <Circle className="size-3.5 text-border" />
              )}
              <span className={todayProgress[t.key] ? 'text-foreground' : 'text-muted-foreground'}>
                {t.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {totalStats[t.key]}/30
              </span>
            </div>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1">
                标记今日完成
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {taskLabels.map((t) => (
                <DropdownMenuCheckboxItem
                  key={t.key}
                  checked={tempTasks[t.key]}
                  onCheckedChange={(checked) => {
                    setTempTasks((prev) => ({ ...prev, [t.key]: checked }));
                    onMarkComplete({ [t.key]: checked });
                  }}
                >
                  {t.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-1 w-full bg-muted/30">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
