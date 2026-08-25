import { useState, useCallback, useMemo, useEffect } from 'react';
import { scopedStorage } from '@/lib/storage';
import { MOCK_ENGLISH_ANSWERS } from '@/data/englishAnswers';

const REVIEW_KEY = '__app_english_review';

interface IReviewItem {
  word: string;
  meaning?: string;
  day: number;
  correctCount: number;
  wrongCount: number;
  lastReviewAt?: number;
}

interface IReviewState {
  items: IReviewItem[];
  currentIndex: number;
  isFlipped: boolean;
  todayReviewed: number;
}

function buildInitialItems(): IReviewItem[] {
  const items: IReviewItem[] = [];
  for (let day = 1; day <= 30; day++) {
    const dayAnswers = MOCK_ENGLISH_ANSWERS[day];
    if (dayAnswers?.vocabQuiz) {
      dayAnswers.vocabQuiz.forEach((q) => {
        items.push({
          word: q.word,
          meaning: q.meaning,
          day,
          correctCount: 0,
          wrongCount: 0,
        });
      });
    }
  }
  return items;
}

function loadState(): IReviewState {
  try {
    const raw = scopedStorage.getItem(REVIEW_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<IReviewState>;
      const base = buildInitialItems();
      // 合并已有的学习记录
      const merged = base.map((item) => {
        const existing = parsed.items?.find(
          (e) => e.word === item.word && e.day === item.day,
        );
        return existing ? { ...item, ...existing } : item;
      });
      return {
        items: merged,
        currentIndex: parsed.currentIndex ?? 0,
        isFlipped: false,
        todayReviewed: parsed.todayReviewed ?? 0,
      };
    }
  } catch {
    // ignore
  }
  return {
    items: buildInitialItems(),
    currentIndex: 0,
    isFlipped: false,
    todayReviewed: 0,
  };
}

export function useEnglishReview() {
  const [state, setState] = useState<IReviewState>(loadState);

  // 持久化
  useEffect(() => {
    try {
      scopedStorage.setItem(REVIEW_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  // 优先复习错词和新词
  const currentItem = useMemo(() => {
    if (state.items.length === 0) return null;
    return state.items[state.currentIndex % state.items.length];
  }, [state.items, state.currentIndex]);

  const flip = useCallback(() => {
    setState((s) => ({ ...s, isFlipped: !s.isFlipped }));
  }, []);

  const markCorrect = useCallback(() => {
    setState((s) => {
      const items = [...s.items];
      const idx = s.currentIndex % items.length;
      items[idx] = {
        ...items[idx],
        correctCount: items[idx].correctCount + 1,
        lastReviewAt: Date.now(),
      };
      return {
        ...s,
        items,
        currentIndex: s.currentIndex + 1,
        isFlipped: false,
        todayReviewed: s.todayReviewed + 1,
      };
    });
  }, []);

  const markWrong = useCallback(() => {
    setState((s) => {
      const items = [...s.items];
      const idx = s.currentIndex % items.length;
      items[idx] = {
        ...items[idx],
        wrongCount: items[idx].wrongCount + 1,
        lastReviewAt: Date.now(),
      };
      // 错词往后放，近期再复习
      return {
        ...s,
        items,
        currentIndex: s.currentIndex + 1,
        isFlipped: false,
        todayReviewed: s.todayReviewed + 1,
      };
    });
  }, []);

  const resetReview = useCallback(() => {
    setState({
      items: buildInitialItems(),
      currentIndex: 0,
      isFlipped: false,
      todayReviewed: 0,
    });
  }, []);

  // 统计
  const stats = useMemo(() => {
    const total = state.items.length;
    const mastered = state.items.filter((i) => i.correctCount >= 3).length;
    const learning = state.items.filter((i) => i.correctCount > 0 && i.correctCount < 3).length;
    const weak = state.items.filter((i) => i.wrongCount >= 2).length;
    const newWords = state.items.filter((i) => i.correctCount === 0 && i.wrongCount === 0).length;
    return { total, mastered, learning, weak, newWords, todayReviewed: state.todayReviewed };
  }, [state.items, state.todayReviewed]);

  return {
    currentItem,
    isFlipped: state.isFlipped,
    flip,
    markCorrect,
    markWrong,
    resetReview,
    stats,
    currentIndex: state.currentIndex,
  };
}
