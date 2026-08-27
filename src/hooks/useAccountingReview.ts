import { useState, useEffect, useCallback } from 'react';
import { scopedStorage } from '@/lib/storage';
import { MOCK_ACCOUNTING } from '@/data/accounting';

/** 会计复习掌握状态 */
export type AccountingMastery = 'new' | 'learning' | 'familiar' | 'mastered';

/** 单个知识点的复习记录 */
export interface AccountingReviewRecord {
  id: string;
  day: number;
  knowledgePoint: string;
  mastery: AccountingMastery;
  reviewCount: number;
  lastReviewedAt: number;
  nextReviewAt: number;
  unfamiliarCount: number;
}

interface AccountingReviewState {
  records: Record<string, AccountingReviewRecord>;
  /** 已生成复习记录的Day集合，避免重复生成 */
  initializedDays: number[];
}

const STORAGE_KEY = '__app_accounting_review';

/** 间隔重复间隔（天），与英语一致 */
function getInterval(reviewCount: number, mastery: AccountingMastery): number {
  if (mastery === 'learning') return 1;
  if (reviewCount <= 0) return 1;
  if (reviewCount === 1) return 3;
  if (reviewCount === 2) return 7;
  if (reviewCount === 3) return 14;
  return 30;
}

function makeRecordId(day: number, knowledgePoint: string): string {
  return `acc_${day}_${knowledgePoint.slice(0, 20)}`;
}

function createInitialState(): AccountingReviewState {
  return { records: {}, initializedDays: [] };
}

export function useAccountingReview() {
  const [state, setState] = useState<AccountingReviewState>(() => {
    try {
      const raw = scopedStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AccountingReviewState;
        return {
          records: parsed.records || {},
          initializedDays: parsed.initializedDays || [],
        };
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

  /**
   * 当某天会计学习完成时，为该天所有知识点生成复习记录。
   * 只生成一次（initializedDays 去重）。
   */
  const initDayForReview = useCallback((day: number) => {
    setState((prev) => {
      if (prev.initializedDays.includes(day)) return prev;
      const dayData = MOCK_ACCOUNTING[day];
      if (!dayData || !dayData.knowledgePoints.length) {
        return { ...prev, initializedDays: [...prev.initializedDays, day] };
      }
      const now = Date.now();
      const newRecords: Record<string, AccountingReviewRecord> = {};
      for (const kp of dayData.knowledgePoints) {
        const id = makeRecordId(day, kp);
        if (!prev.records[id]) {
          newRecords[id] = {
            id,
            day,
            knowledgePoint: kp,
            mastery: 'new',
            reviewCount: 0,
            lastReviewedAt: now,
            nextReviewAt: now + 1 * 24 * 60 * 60 * 1000, // 首次学习后1天复习
            unfamiliarCount: 0,
          };
        }
      }
      return {
        records: { ...prev.records, ...newRecords },
        initializedDays: [...prev.initializedDays, day],
      };
    });
  }, []);

  /** 复习一个知识点 */
  const reviewPoint = useCallback(
    (id: string, mastery: AccountingMastery) => {
      const now = Date.now();
      setState((prev) => {
        const existing = prev.records[id];
        if (!existing) return prev;
        const nextCount = existing.reviewCount + 1;
        const interval = getInterval(nextCount, mastery);
        return {
          ...prev,
          records: {
            ...prev.records,
            [id]: {
              ...existing,
              mastery,
              reviewCount: nextCount,
              lastReviewedAt: now,
              nextReviewAt: now + interval * 24 * 60 * 60 * 1000,
              unfamiliarCount:
                mastery === 'learning'
                  ? existing.unfamiliarCount + 1
                  : existing.unfamiliarCount,
            },
          },
        };
      });
    },
    [],
  );

  /** 获取今日到期复习的知识点，按优先级排序 */
  const getDuePoints = useCallback((): AccountingReviewRecord[] => {
    const now = Date.now();
    const due = Object.values(state.records).filter((r) => r.nextReviewAt <= now);
    return due.sort((a, b) => {
      const aUnfamiliar = a.mastery === 'learning' ? 1 : 0;
      const bUnfamiliar = b.mastery === 'learning' ? 1 : 0;
      if (aUnfamiliar !== bUnfamiliar) return bUnfamiliar - aUnfamiliar;
      if (a.unfamiliarCount !== b.unfamiliarCount)
        return b.unfamiliarCount - a.unfamiliarCount;
      const aMastered = a.mastery === 'mastered' ? 1 : 0;
      const bMastered = b.mastery === 'mastered' ? 1 : 0;
      if (aMastered !== bMastered) return aMastered - bMastered;
      return a.nextReviewAt - b.nextReviewAt;
    });
  }, [state]);

  /** 今日待复习数量 */
  const getDueCount = useCallback((): number => {
    const now = Date.now();
    return Object.values(state.records).filter((r) => r.nextReviewAt <= now).length;
  }, [state]);

  return {
    state,
    initDayForReview,
    reviewPoint,
    getDuePoints,
    getDueCount,
  };
}
