import { useState, useEffect, useCallback } from 'react';
import { scopedStorage } from '@/lib/storage';

/** 单词掌握状态 */
export type WordMastery = 'new' | 'learning' | 'familiar' | 'mastered';

/** 单个单词的学习记录 */
export interface WordRecord {
  /** 唯一键：day_word 例如 1_routine */
  id: string;
  word: string;
  day: number;
  mastery: WordMastery;
  /** 学习次数 */
  studyCount: number;
  /** 上次学习时间戳 */
  lastStudiedAt: number;
  /** 下次复习时间戳（间隔重复） */
  nextReviewAt: number;
  /** 标记为不熟的次数 */
  unfamiliarCount: number;
}

export interface WordLearningState {
  records: Record<string, WordRecord>;
}

const STORAGE_KEY = '__app_word_learning';

/**
 * 间隔重复间隔（天），基于学习次数：
 * 第1次：1天，第2次：3天，第3次：7天，第4次：14天，第5次起：30天
 * 标记"不熟"时强制1天后复习
 */
function getInterval(studyCount: number, mastery: WordMastery): number {
  if (mastery === 'learning') return 1; // 不熟 → 1天后再来
  if (studyCount <= 1) return 1;
  if (studyCount === 2) return 3;
  if (studyCount === 3) return 7;
  if (studyCount === 4) return 14;
  return 30; // 第5次起长期复习
}

function createInitialState(): WordLearningState {
  return { records: {} };
}

function makeWordId(day: number, word: string): string {
  return `${day}_${word.toLowerCase()}`;
}

export function useWordLearning() {
  const [state, setState] = useState<WordLearningState>(() => {
    try {
      const raw = scopedStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WordLearningState;
        return { ...createInitialState(), ...parsed };
      }
    } catch {
      // ignore
    }
    return createInitialState();
  });

  useEffect(() => {
    try {
      scopedStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  /** 学习一个单词（首次或再次） */
  const studyWord = useCallback((day: number, word: string, mastery: WordMastery) => {
    const id = makeWordId(day, word);
    const now = Date.now();
    setState((prev) => {
      const existing = prev.records[id];
      const nextCount = existing ? existing.studyCount + 1 : 1;
      const interval = getInterval(nextCount, mastery);
      const record: WordRecord = existing
        ? {
            ...existing,
            mastery,
            studyCount: nextCount,
            lastStudiedAt: now,
            nextReviewAt: now + interval * 24 * 60 * 60 * 1000,
            unfamiliarCount:
              mastery === 'learning'
                ? existing.unfamiliarCount + 1
                : existing.unfamiliarCount,
          }
        : {
            id,
            word,
            day,
            mastery,
            studyCount: 1,
            lastStudiedAt: now,
            nextReviewAt: now + interval * 24 * 60 * 60 * 1000,
            unfamiliarCount: mastery === 'learning' ? 1 : 0,
          };
      return { ...prev, records: { ...prev.records, [id]: record } };
    });
  }, []);

  /** 标记为不熟（重置为近期复习） */
  const markUnfamiliar = useCallback(
    (day: number, word: string) => {
      studyWord(day, word, 'learning');
    },
    [studyWord],
  );

  /** 标记为已掌握 */
  const markMastered = useCallback(
    (day: number, word: string) => {
      studyWord(day, word, 'mastered');
    },
    [studyWord],
  );

  /** 获取某单词的学习记录 */
  const getRecord = useCallback(
    (day: number, word: string): WordRecord | undefined => {
      return state.records[makeWordId(day, word)];
    },
    [state],
  );

  /** 获取某天的单词学习统计 */
  const getDayStats = useCallback(
    (day: number) => {
      const dayRecords = Object.values(state.records).filter((r) => r.day === day);
      return {
        total: dayRecords.length,
        new: dayRecords.filter((r) => r.mastery === 'new').length,
        learning: dayRecords.filter((r) => r.mastery === 'learning').length,
        familiar: dayRecords.filter((r) => r.mastery === 'familiar').length,
        mastered: dayRecords.filter((r) => r.mastery === 'mastered').length,
      };
    },
    [state],
  );

  /**
   * 获取今日到期需要复习的单词（含已掌握的长期复习）。
   * 优先级排序：
   * 1. 标记"不熟"的单词（mastery=learning）
   * 2. 不熟次数多的单词
   * 3. 普通到期单词（familiar/new）
   * 4. 已掌握但进入长期复习的单词
   */
  const getDueWords = useCallback((): WordRecord[] => {
    const now = Date.now();
    const due = Object.values(state.records).filter((r) => r.nextReviewAt <= now);
    return due.sort((a, b) => {
      // 第一优先：不熟的单词
      const aUnfamiliar = a.mastery === 'learning' ? 1 : 0;
      const bUnfamiliar = b.mastery === 'learning' ? 1 : 0;
      if (aUnfamiliar !== bUnfamiliar) return bUnfamiliar - aUnfamiliar;
      // 第二优先：不熟次数多的
      if (a.unfamiliarCount !== b.unfamiliarCount)
        return b.unfamiliarCount - a.unfamiliarCount;
      // 第三优先：已掌握的长期复习排最后
      const aMastered = a.mastery === 'mastered' ? 1 : 0;
      const bMastered = b.mastery === 'mastered' ? 1 : 0;
      if (aMastered !== bMastered) return aMastered - bMastered;
      // 第四优先：到期时间早的先复习
      return a.nextReviewAt - b.nextReviewAt;
    });
  }, [state]);

  /** 获取今日待复习数量 */
  const getReviewCount = useCallback((): number => {
    const now = Date.now();
    return Object.values(state.records).filter((r) => r.nextReviewAt <= now).length;
  }, [state]);

  /** 重置所有学习记录 */
  const resetAll = useCallback(() => {
    setState(createInitialState());
  }, []);

  return {
    state,
    studyWord,
    markUnfamiliar,
    markMastered,
    getRecord,
    getDayStats,
    getDueWords,
    getReviewCount,
    resetAll,
  };
}
