import { useState, useMemo } from 'react';
import { scopedStorage } from '@/lib/storage';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Languages,
  Video,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Check,
  Circle,
  BookOpen,
  Sparkles,
  Menu,
} from 'lucide-react';
import { type NavItem } from '@/config/navConfig';
import type { IStudyProgress } from '@/hooks/useStudyProgress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const COLLAPSED_KEY = '__app_nav_collapsed';
const EXPANDED_KEY = '__app_nav_expanded_groups';

interface StudySidebarProps {
  items: NavItem[];
  selectedId: string;
  onSelect: (item: NavItem) => void;
  progress: IStudyProgress;
  currentDay: number;
  forceMobile?: boolean;
}

function getIconForGroup(label: string, id: string) {
  if (id.startsWith('accounting')) return Calculator;
  if (id.startsWith('english')) return Languages;
  if (id.startsWith('selfmedia')) return Video;
  if (id.startsWith('overview')) return LayoutDashboard;
  return BookOpen;
}

function getItemProgressIcon(item: NavItem, progress: IStudyProgress) {
  if (item.payload?.kind === 'accounting-day' && item.payload.day) {
    const done = progress[item.payload.day]?.accounting;
    return done ? (
      <Check className="size-3.5 text-primary shrink-0" />
    ) : (
      <Circle className="size-3.5 text-border shrink-0" />
    );
  }
  if (item.payload?.kind === 'english-day' && item.payload.day) {
    const done = progress[item.payload.day]?.english;
    return done ? (
      <Check className="size-3.5 text-info shrink-0" />
    ) : (
      <Circle className="size-3.5 text-border shrink-0" />
    );
  }
  return null;
}

function SidebarNav({
  items,
  selectedId,
  onSelect,
  progress,
  isCollapsed,
}: {
  items: NavItem[];
  selectedId: string;
  onSelect: (item: NavItem) => void;
  progress: IStudyProgress;
  isCollapsed: boolean;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    try {
      const raw = scopedStorage.getItem(EXPANDED_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {
      overview: true,
      accounting: true,
      'accounting-stage-1': true,
    };
  });

  const toggleGroup = (id: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        scopedStorage.setItem(EXPANDED_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const renderItem = (item: NavItem, depth: number = 0) => {
    const isSelected = selectedId === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.id];
    const Icon = item.type === 'group' ? getIconForGroup(item.label, item.id) : null;
    const progressIcon = getItemProgressIcon(item, progress);

    if (item.type === 'group') {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleGroup(item.id)}
            className={cn(
              'w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-medium text-foreground/80 hover:bg-accent/60 transition-colors',
              isCollapsed && 'justify-center px-1',
            )}
            title={isCollapsed ? item.label : undefined}
          >
            {Icon && <Icon className="size-4 shrink-0 text-primary" />}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {isExpanded ? (
                  <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                )}
              </>
            )}
          </button>
          {hasChildren && !isCollapsed && isExpanded && (
            <div className="mt-1 space-y-0.5 pl-2">
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (item.type === 'stage') {
      return (
        <div key={item.id} className="mb-0.5">
          <button
            onClick={() => toggleGroup(item.id)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground/80 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="size-3 shrink-0" />
            ) : (
              <ChevronRight className="size-3 shrink-0" />
            )}
            <span className="flex-1 text-left truncate">{item.label}</span>
          </button>
          {hasChildren && isExpanded && (
            <div className="mt-0.5 space-y-0.5 pl-4">
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => onSelect(item)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left',
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-foreground/70 hover:bg-accent/40 hover:text-foreground',
        )}
      >
        {progressIcon || <span className="size-3.5 shrink-0" />}
        <span className="flex-1 truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="py-2 space-y-1">
      {items.map((item) => renderItem(item))}
    </div>
  );
}

export default function StudySidebar({
  items,
  selectedId,
  onSelect,
  progress,
  currentDay,
  forceMobile = false,
}: StudySidebarProps) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const raw = scopedStorage.getItem(COLLAPSED_KEY);
      if (raw) return raw === 'true';
    } catch {
      // ignore
    }
    return false;
  });

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      scopedStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {
      // ignore
    }
  };

  const stats = useMemo(() => {
    const all = Object.values(progress);
    return {
      accounting: all.filter((p) => p.accounting).length,
      english: all.filter((p) => p.english).length,
      selfmedia: all.filter((p) => p.selfmedia).length,
    };
  }, [progress]);

  const sidebarBody = (
    <div className="h-full flex flex-col bg-white border-r border-border/60">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="size-4.5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">30天成长计划</p>
              <p className="text-[11px] text-muted-foreground truncate">第{currentDay}天 · 一起加油</p>
            </div>
          )}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleCollapse}
            className="size-7 shrink-0"
            aria-label={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronRight className="size-4 rotate-180" />}
          </Button>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-3 py-3 border-b border-border/40">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-2 rounded-md bg-primary/5">
              <p className="text-base font-bold text-primary tabular-nums">{stats.accounting}</p>
              <p className="text-[10px] text-muted-foreground">会计</p>
            </div>
            <div className="p-2 rounded-md bg-info/5">
              <p className="text-base font-bold text-info tabular-nums">{stats.english}</p>
              <p className="text-[10px] text-muted-foreground">英语</p>
            </div>
            <div className="p-2 rounded-md bg-success/5">
              <p className="text-base font-bold text-success tabular-nums">{stats.selfmedia}</p>
              <p className="text-[10px] text-muted-foreground">自媒体</p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-2">
        <SidebarNav
          items={items}
          selectedId={selectedId}
          onSelect={onSelect}
          progress={progress}
          isCollapsed={isCollapsed}
        />
      </ScrollArea>

      {!isCollapsed && (
        <div className="px-3 py-3 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground text-center">
            💪 每天进步一点点
          </p>
        </div>
      )}
    </div>
  );

  if (forceMobile) {
    return (
      <div className="h-full flex flex-col bg-white w-full overflow-hidden">
        <div className="flex items-center px-3 py-3 border-b border-border/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="size-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">30天成长计划</p>
              <p className="text-[11px] text-muted-foreground truncate">第{currentDay}天 · 一起加油</p>
            </div>
          </div>
        </div>
        <div className="px-3 py-3 border-b border-border/40">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-2 rounded-md bg-primary/5">
              <p className="text-base font-bold text-primary tabular-nums">{stats.accounting}</p>
              <p className="text-[10px] text-muted-foreground">会计</p>
            </div>
            <div className="p-2 rounded-md bg-info/5">
              <p className="text-base font-bold text-info tabular-nums">{stats.english}</p>
              <p className="text-[10px] text-muted-foreground">英语</p>
            </div>
            <div className="p-2 rounded-md bg-success/5">
              <p className="text-base font-bold text-success tabular-nums">{stats.selfmedia}</p>
              <p className="text-[10px] text-muted-foreground">自媒体</p>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 px-2">
          <SidebarNav
            items={items}
            selectedId={selectedId}
            onSelect={onSelect}
            progress={progress}
            isCollapsed={false}
          />
        </ScrollArea>
        <div className="px-3 py-3 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground text-center">
            💪 每天进步一点点
          </p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="打开导航"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            {sidebarBody}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 transition-all duration-200 ease-in-out',
        isCollapsed ? 'w-[60px]' : 'w-64',
      )}
    >
      {sidebarBody}
    </aside>
  );
}
