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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const CURRENT_ITEM_KEY = '__app_current_item';

export default function WorkbenchPage() {
  const { progress, currentDay, setCurrentDay, toggleTask, setDayTasks, resetAll, stats, completedDays } =
    useStudyProgress();

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

  useEffect(() => {
    try {
      scopedStorage.setItem(CURRENT_ITEM_KEY, selectedId);
    } catch {
      // ignore
    }
  }, [selectedId]);

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
    return selectedItem.label;
  }, [selectedItem]);

  const handleNavSelect = (item: NavItem) => {
    if (item.type === 'item' && item.payload) {
      setSelectedId(item.id);
      if (item.payload.day) {
        setCurrentDay(item.payload.day);
      }
    }
    setMobileNavOpen(false);
  };

  const handleDaySelect = (day: number, kind: 'accounting' | 'english') => {
    const id = `${kind}-day-${day}`;
    setSelectedId(id);
    setCurrentDay(day);
  };

  const renderPanel = () => {
    if (!selectedItem?.payload) {
      return <DailyCombinedPanel day={currentDay} progress={progress[currentDay]} onDaySelect={handleDaySelect} />;
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
            onToggleComplete={() => toggleTask(day || 1, 'accounting')}
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
            activeModule={moduleId || 'positioning'}
            initialTab={moduleId || 'warroom'}
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
      default:
        return (
          <DailyCombinedPanel
            day={currentDay}
            progress={progress[currentDay]}
            onDaySelect={handleDaySelect}
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
