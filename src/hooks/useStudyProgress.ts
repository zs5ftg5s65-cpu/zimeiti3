import { useState, useEffect, useCallback } from 'react';
import { scopedStorage } from '@/lib/storage';
import {
  ensureStartDateISO,
  resetStartDateISO,
  todayISOLocal,
  getTodayDay,
} from '@/lib/studyDate';

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
  // 30天计划开始日期：只在首次不存在时建立一次，之后刷新/重开都复用，绝不被今天覆盖
  const [startDate, setStartDate] = useState<string>(() => ensureStartDateISO());

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
    // 显式重置：清空进度与选中天，并清除开始日期，使新计划在下次进入时以"当天"重新建立
    resetStartDateISO();
    const fresh = todayISOLocal();
    scopedStorage.setItem('__app_study_start_date', fresh);
    setStartDate(fresh);
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

  // 今天对应计划第几天（1..30，超出区间为 null）；仅用于"回到今天"，不自动覆盖选中天
  const todayDay = getTodayDay(startDate);
  return {
    progress,
    currentDay,
    startDate,
    todayDay,
    setCurrentDay,
    toggleTask,
    setDayTasks,
    resetAll,
    stats,
    completedDays,
  };
}
