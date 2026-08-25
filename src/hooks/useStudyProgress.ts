import { useState, useEffect, useCallback } from 'react';
import { scopedStorage } from '@/lib/storage';

export interface IDayProgress {
  accounting: boolean;
  english: boolean;
  selfmedia: boolean;
  updatedAt?: number;
}

export interface IStudyProgress {
  [day: number]: IDayProgress;
}

const STORAGE_KEY = '__app_study_progress';
const CURRENT_DAY_KEY = '__app_current_day';

function createInitialProgress(): IStudyProgress {
  const progress: IStudyProgress = {};
  for (let i = 1; i <= 30; i++) {
    progress[i] = { accounting: false, english: false, selfmedia: false };
  }
  return progress;
}

export function useStudyProgress() {
  const [progress, setProgress] = useState<IStudyProgress>(() => {
    try {
      const raw = scopedStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as IStudyProgress;
        // 补齐缺失天数
        const initial = createInitialProgress();
        return { ...initial, ...parsed };
      }
    } catch {
      // ignore
    }
    return createInitialProgress();
  });

  const [currentDay, setCurrentDayState] = useState<number>(() => {
    try {
      const raw = scopedStorage.getItem(CURRENT_DAY_KEY);
      if (raw) {
        const d = parseInt(raw, 10);
        if (d >= 1 && d <= 30) return d;
      }
    } catch {
      // ignore
    }
    return 1;
  });

  // 持久化
  useEffect(() => {
    try {
      scopedStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  useEffect(() => {
    try {
      scopedStorage.setItem(CURRENT_DAY_KEY, String(currentDay));
    } catch {
      // ignore
    }
  }, [currentDay]);

  const toggleTask = useCallback((day: number, task: keyof IDayProgress) => {
    setProgress((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [task]: !prev[day][task],
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const setDayTasks = useCallback((day: number, tasks: Partial<IDayProgress>) => {
    setProgress((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...tasks,
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const setCurrentDay = useCallback((day: number) => {
    if (day >= 1 && day <= 30) {
      setCurrentDayState(day);
    }
  }, []);

  const resetAll = useCallback(() => {
    setProgress(createInitialProgress());
    setCurrentDayState(1);
  }, []);

  // 统计
  const stats = {
    accounting: Object.values(progress).filter((p) => p.accounting).length,
    english: Object.values(progress).filter((p) => p.english).length,
    selfmedia: Object.values(progress).filter((p) => p.selfmedia).length,
  };

  // 计算当前完成天数（三项都完成才算一天）
  const completedDays = Object.values(progress).filter(
    (p) => p.accounting && p.english && p.selfmedia,
  ).length;

  return {
    progress,
    currentDay,
    setCurrentDay,
    toggleTask,
    setDayTasks,
    resetAll,
    stats,
    completedDays,
  };
}
