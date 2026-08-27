import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw,
  Volume2, BookOpen, Trophy,
} from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { MOCK_ENGLISH_DAYS, type IVocabWord } from '@/data/english';
import type { WordRecord, WordMastery } from '@/hooks/useWordLearning';
import { cn } from '@/lib/utils';

interface ReviewWordModalProps {
  open: boolean;
  onClose: () => void;
  dueRecords: WordRecord[];
  onReview: (day: number, word: string, mastery: WordMastery) => void;
}

const MASTERY_LABELS: Record<WordMastery, string> = {
  new: '未学习',
  learning: '学习中',
  familiar: '熟悉',
  mastered: '已掌握',
};

/** 从英语课程数据中查找单词详情 */
function findWordData(day: number, word: string): IVocabWord | undefined {
  const dayData = MOCK_ENGLISH_DAYS.find((d) => d.day === day);
  const words = dayData?.vocab || dayData?.vocabulary || [];
  return words.find((w) => w.word.toLowerCase() === word.toLowerCase());
}

export default function ReviewWordModal({
  open,
  onClose,
  dueRecords,
  onReview,
}: ReviewWordModalProps) {
  // 打开时固化复习列表，避免复习过程中列表变化导致索引错位
  const [records, setRecords] = useState<WordRecord[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [finished, setFinished] = useState(false);
  const { speak, isSpeaking } = useSpeech();

  useEffect(() => {
    if (open && dueRecords.length > 0) {
      setRecords(dueRecords);
      setIndex(0);
      setShowAnswer(false);
      setCompleted(0);
      setFinished(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open || records.length === 0) return null;

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Trophy className="size-12 text-success mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">今日复习完成！</h3>
          <p className="text-sm text-muted-foreground mb-4">
            共复习 <span className="font-bold text-primary">{completed}</span> 个单词，继续保持
          </p>
          <Button onClick={onClose} className="w-full">完成</Button>
        </motion.div>
      </div>
    );
  }

  const record = records[index];
  const wordData = findWordData(record.day, record.word);
  const word = wordData?.word || record.word;
  const phonetic = wordData?.phonetic || '';
  const meaning = wordData?.meaning || record.word;
  const example = wordData?.example || '';
  const exampleCn = wordData?.exampleCn || '';

  const goNext = () => {
    setShowAnswer(false);
    const next = index + 1;
    if (next >= records.length) {
      setFinished(true);
    } else {
      setIndex(next);
    }
  };

  const goPrev = () => {
    setShowAnswer(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  const handleReview = (mastery: WordMastery) => {
    onReview(record.day, record.word, mastery);
    setCompleted((c) => c + 1);
    goNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <span className="text-sm font-semibold">英语复习</span>
            <Badge variant="secondary" className="text-xs">
              {index + 1}/{records.length}
            </Badge>
          </div>
          <button onClick={onClose} className="size-8 rounded-md hover:bg-muted flex items-center justify-center">
            <X className="size-4" />
          </button>
        </div>

        {/* 进度条 */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((index + 1) / records.length) * 100}%` }}
          />
        </div>

        {/* 单词卡片 */}
        <div className="p-6 min-h-[280px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs">
              第{record.day}天 · {MASTERY_LABELS[record.mastery]}
            </Badge>
            {record.unfamiliarCount > 0 && (
              <span className="text-xs text-warning">曾标记不熟 {record.unfamiliarCount} 次</span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-foreground">{word}</h3>
                <button
                  onClick={() => speak(word)}
                  className="size-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center shrink-0"
                  aria-label="发音"
                >
                  <Volume2 className={cn('size-4 text-primary', isSpeaking && 'animate-pulse')} />
                </button>
              </div>
              {phonetic && <p className="text-sm text-muted-foreground font-mono mb-1">{phonetic}</p>}

              {showAnswer ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 mt-2"
                >
                  <p className="text-base text-foreground/90">{meaning}</p>
                  {example && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <p className="text-sm text-foreground/90">{example}</p>
                      {exampleCn && <p className="text-xs text-muted-foreground mt-1">{exampleCn}</p>}
                      <button
                        onClick={() => speak(example)}
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        <Volume2 className="size-3" /> 朗读例句
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="flex-1 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/60 rounded-lg min-h-[80px] mt-2"
                >
                  点击查看释义
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 操作按钮 */}
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReview('learning')}
              className="text-xs border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <XCircle className="size-3.5 mr-1" />
              不熟
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReview('familiar')}
              className="text-xs border-info/30 text-info hover:bg-info/5"
            >
              <RotateCcw className="size-3.5 mr-1" />
              熟悉
            </Button>
            <Button
              size="sm"
              onClick={() => handleReview('mastered')}
              className="text-xs bg-success hover:bg-success/90"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              掌握
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goPrev} disabled={index === 0}>
              <ChevronLeft className="size-4" /> 上一个
            </Button>
            <span className="text-xs text-muted-foreground">已复习 {completed}</span>
            <Button variant="ghost" size="sm" onClick={goNext}>
              跳过 <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
