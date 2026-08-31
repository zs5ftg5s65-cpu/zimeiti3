import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { scopedStorage } from '@/lib/storage';
import StudySidebar from '@/components/StudySidebar';
import TopProgressBar from '@/components/TopProgressBar';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { NAV_CONFIG, type NavItem } from '@/config/navConfig';
import DailyCombinedPanel from '@/components/panels/DailyCombinedPanel';
import AccountingDetailPanel from '@/components/panels/AccountingDetailPanel';
import EnglishDetailPanel from '@/components/panels/EnglishDetailPanel';
import EnglishResourcesPanel from '@/components/panels/EnglishResourcesPanel';
import SelfmediaPanel from '@/components/panels/SelfmediaPanel';
import OverviewPanel from '@/components/panels/OverviewPanel';
import ReviewCenterPanel from '@/components/panels/ReviewCenterPanel';
import { useAccountingReview } from '@/hooks/useAccountingReview';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const CURRENT_ITEM_KEY = '__app_current_item';

export default function WorkbenchPage() {
  const { progress, currentDay, setCurrentDay, toggleTask, setDayTasks, resetAll, stats, completedDays } =
    useStudyProgress();
  const { initDayForReview } = useAccountingReview();

  const [selectedId, setSelectedId] = useState<string>(() => {
    try {
      const raw = scopedStorage.getItem(CURRENT_ITEM_KEY);
      if (raw) return raw;
    } catch {
      // ignore
    }
    return 'overview-schedule';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selfmediaTab, setSelfmediaTab] = useState<string>('warroom');

  useEffect(() => {
    try {
      scopedStorage.setItem(CURRENT_ITEM_KEY, selectedId);
    } catch {
      // ignore
    }
  }, [selectedId]);

  // 无论通过哪条路径（详情页按钮 / 顶部"标记今日完成"），
  // 只要会计某天从未完成变为完成，就自动生成该天复习记录。
  // initDayForReview 内部有 initializedDays 去重，不会重复生成。
  useEffect(() => {
    for (let d = 1; d <= 30; d++) {
      if (progress[d]?.accounting) {
        initDayForReview(d);
      }
    }
  }, [progress, initDayForReview]);

  const selectedItem = useMemo(() => {
    function findItem(items: NavItem[], id: string): NavItem | null {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
      return null;
    }
    return findItem(NAV_CONFIG, selectedId);
  }, [selectedId]);

  const pageTitle = useMemo(() => {
    if (!selectedItem) return '学习工作台';
    if (selectedItem.payload?.kind === 'accounting-day') {
      return `会计实操 · 第${selectedItem.payload.day}天`;
    }
    if (selectedItem.payload?.kind === 'english-day') {
      return `英语学习 · 第${selectedItem.payload.day}天`;
    }
    if (selectedItem.payload?.kind === 'selfmedia-module') {
      return `自媒体 · ${selectedItem.label}`;
    }
    if (selectedItem.payload?.kind === 'selfmedia-script') {
      return '自媒体 · 智能创作';
    }
    if (selectedItem.payload?.kind === 'selfmedia-data') {
      return '自媒体 · 数据与历史';
    }
    if (selectedItem.payload?.kind === 'selfmedia-daily') {
      return '自媒体 · 30天成长计划';
    }
    if (selectedItem.payload?.kind === 'review-center') {
      return '复习中心';
    }
    return selectedItem.label;
  }, [selectedItem]);

  const handleNavSelect = (item: NavItem) => {
    if (item.type === 'item' && item.payload) {
      setSelectedId(item.id);
      if (item.payload.day) {
        setCurrentDay(item.payload.day);
      }
      // 同步自媒体目标tab
      if (item.payload.moduleId) {
        setSelfmediaTab(item.payload.moduleId);
      }
    }
    setMobileNavOpen(false);
  };

  const handleDaySelect = (day: number, kind: 'accounting' | 'english' | 'selfmedia') => {
    if (kind === 'selfmedia') {
      setSelectedId('selfmedia3-warroom');
      setCurrentDay(day);
      return;
    }
    const id = `${kind}-day-${day}`;
    setSelectedId(id);
    setCurrentDay(day);
  };

  // 回到今天：统一改 currentDay；若正停在某模块的 Day 详情页，同步把该面板切到今天对应 Day，避免顶部与内容不一致
  const handleGoToday = (todayDay: number) => {
    setCurrentDay(todayDay);
    const kind = selectedItem?.payload?.kind;
    if (kind === 'accounting-day') setSelectedId(`accounting-day-${todayDay}`);
    else if (kind === 'english-day') setSelectedId(`english-day-${todayDay}`);
  };

  const handleReviewNavigate = (
    kind: 'accounting' | 'english' | 'selfmedia',
    day?: number,
    tab?: string,
  ) => {
    if (kind === 'selfmedia') {
      setSelfmediaTab(tab || 'warroom');
      setSelectedId('selfmedia3-warroom');
    } else {
      const targetDay = day || currentDay;
      setSelectedId(`${kind}-day-${targetDay}`);
      setCurrentDay(targetDay);
    }
  };

  /** 会计Day完成时，同时生成该天知识点的复习记录 */
  const handleAccountingToggle = (day: number) => {
    const wasCompleted = progress[day]?.accounting;
    toggleTask(day, 'accounting');
    if (!wasCompleted) {
      initDayForReview(day);
    }
  };

  const renderPanel = () => {
    if (!selectedItem?.payload) {
      return (
        <DailyCombinedPanel
          day={currentDay}
          progress={progress[currentDay]}
          onDaySelect={handleDaySelect}
          onOpenReview={() => setSelectedId('review-center')}
        />
      );
    }
    const { kind, day, moduleId } = selectedItem.payload;
    switch (kind) {
      case 'overview-schedule':
      case 'overview-checkin':
        return (
          <OverviewPanel
            tab={kind === 'overview-schedule' ? 'schedule' : 'checkin'}
            onDaySelect={(d) => handleDaySelect(d, 'accounting')}
          />
        );
      case 'accounting-day':
        return (
          <AccountingDetailPanel
            day={day || 1}
            isCompleted={progress[day || 1]?.accounting}
            onToggleComplete={() => handleAccountingToggle(day || 1)}
            onDayChange={(d) => {
              setCurrentDay(d);
              setSelectedId(`accounting-day-${d}`);
            }}
          />
        );
      case 'english-day':
        return (
          <EnglishDetailPanel
            day={day || 1}
            isCompleted={progress[day || 1]?.english}
            onToggleComplete={() => toggleTask(day || 1, 'english')}
            onDayChange={(d) => {
              setCurrentDay(d);
              setSelectedId(`english-day-${d}`);
            }}
          />
        );
      case 'english-resources':
        return <EnglishResourcesPanel />;
      case 'english-tools':
        return <EnglishResourcesPanel showTools />;
      case 'selfmedia-module':
      case 'selfmedia-script':
      case 'selfmedia-data':
        return (
          <SelfmediaPanel
            activeModule={moduleId || 'warroom'}
            initialTab={selfmediaTab || moduleId || 'warroom'}
            isCompleted={progress[currentDay]?.selfmedia}
            onToggleComplete={() => toggleTask(currentDay, 'selfmedia')}
            currentDay={currentDay}
          />
        );
      case 'selfmedia-daily':
        return (
          <SelfmediaPanel
            activeModule="daily"
            initialTab="daily"
            isCompleted={progress[currentDay]?.selfmedia}
            onToggleComplete={() => toggleTask(currentDay, 'selfmedia')}
            currentDay={currentDay}
          />
        );
      case 'review-center':
        return (
          <ReviewCenterPanel
            currentDay={currentDay}
            onNavigate={handleReviewNavigate}
          />
        );
      default:
        return (
          <DailyCombinedPanel
            day={currentDay}
            progress={progress[currentDay]}
            onDaySelect={handleDaySelect}
            onOpenReview={() => setSelectedId('review-center')}
          />
        );
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-x-hidden">
      <TopProgressBar
        currentDay={currentDay}
        todayProgress={progress[currentDay]}
        onMarkComplete={(tasks) => setDayTasks(currentDay, tasks)}
        totalStats={stats}
        onGoToday={handleGoToday}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* 桌面端侧边栏（md以上显示，自带移动端Sheet但移动端由下方自定义header替代） */}
        <div className="hidden md:flex">
          <StudySidebar
            items={NAV_CONFIG}
            selectedId={selectedId}
            onSelect={handleNavSelect}
            progress={progress}
            currentDay={currentDay}
          />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          {/* 移动端顶部导航栏 */}
          <div className="md:hidden sticky top-0 z-20 flex items-center gap-2 px-3 py-2 bg-card border-b border-border/60">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <button
                  className="shrink-0 size-9 flex items-center justify-center rounded-md hover:bg-accent active:bg-accent"
                  aria-label="打开导航菜单"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetTitle className="sr-only">导航菜单</SheetTitle>
                <StudySidebar
                  items={NAV_CONFIG}
                  selectedId={selectedId}
                  onSelect={handleNavSelect}
                  progress={progress}
                  currentDay={currentDay}
                  forceMobile
                />
              </SheetContent>
            </Sheet>
            <h2 className="text-base font-bold text-foreground truncate pr-2">{pageTitle}</h2>
          </div>

          <div className="max-w-4xl mx-auto px-3 md:px-8 py-4 md:py-8">
            <div className="hidden md:block mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{pageTitle}</h2>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
