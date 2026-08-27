import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw,
  Volume2, BookOpen,
} from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import type { IVocabWord } from '@/data/english';
import type { WordMastery, WordRecord } from '@/hooks/useWordLearning';
import { cn } from '@/lib/utils';

interface WordStudyModalProps {
  open: boolean;
  onClose: () => void;
  day: number;
  words: IVocabWord[];
  getRecord: (day: number, word: string) => WordRecord | undefined;
  onStudy: (day: number, word: string, mastery: WordMastery) => void;
  onMarkUnfamiliar: (day: number, word: string) => void;
  onMarkMastered: (day: number, word: string) => void;
}

const MASTERY_LABELS: Record<WordMastery, string> = {
  new: '未学习',
  learning: '学习中',
  familiar: '熟悉',
  mastered: '已掌握',
};

const MASTERY_COLORS: Record<WordMastery, string> = {
  new: 'bg-muted text-muted-foreground',
  learning: 'bg-warning/15 text-warning border-warning/20',
  familiar: 'bg-info/15 text-info border-info/20',
  mastered: 'bg-success/15 text-success border-success/20',
};

export default function WordStudyModal({
  open,
  onClose,
  day,
  words,
  getRecord,
  onStudy,
  onMarkUnfamiliar,
  onMarkMastered,
}: WordStudyModalProps) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { speak, isSpeaking } = useSpeech();

  if (!open || words.length === 0) return null;

  const word = words[index];
  const record = getRecord(day, word.word);
  const mastery: WordMastery = record?.mastery || 'new';

  const goNext = () => {
    setShowAnswer(false);
    setIndex((i) => (i + 1) % words.length);
  };

  const goPrev = () => {
    setShowAnswer(false);
    setIndex((i) => (i - 1 + words.length) % words.length);
  };

  const handleMastered = () => {
    onMarkMastered(day, word.word);
    goNext();
  };

  const handleUnfamiliar = () => {
    onMarkUnfamiliar(day, word.word);
    goNext();
  };

  const handleFamiliar = () => {
    onStudy(day, word.word, 'familiar');
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
            <span className="text-sm font-semibold">单词学习 · 第{day}天</span>
            <Badge variant="secondary" className="text-xs">{index + 1}/{words.length}</Badge>
          </div>
          <button onClick={onClose} className="size-8 rounded-md hover:bg-muted flex items-center justify-center">
            <X className="size-4" />
          </button>
        </div>

        {/* 进度条 */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((index + 1) / words.length) * 100}%` }}
          />
        </div>

        {/* 单词卡片 */}
        <div className="p-6 min-h-[280px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Badge className={cn('text-xs', MASTERY_COLORS[mastery])}>
              {MASTERY_LABELS[mastery]}
            </Badge>
            {record && (
              <span className="text-xs text-muted-foreground">
                已学{record.studyCount}次
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-foreground">{word.word}</h3>
                <button
                  onClick={() => speak(word.word)}
                  className="size-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center shrink-0"
                  aria-label="发音"
                >
                  <Volume2 className={cn('size-4 text-primary', isSpeaking && 'animate-pulse')} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-1">{word.phonetic}</p>
              <p className="text-base text-foreground/90 mb-4">{word.meaning}</p>

              {showAnswer ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/40"
                >
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">例句</p>
                    <p className="text-sm text-foreground/90">{word.example}</p>
                    <p className="text-xs text-muted-foreground mt-1">{word.exampleCn}</p>
                  </div>
                  <button
                    onClick={() => speak(word.example)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="size-3" /> 朗读例句
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="flex-1 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/60 rounded-lg min-h-[80px]"
                >
                  点击显示例句和释义
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
              onClick={handleUnfamiliar}
              className="text-xs border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <XCircle className="size-3.5 mr-1" />
              不熟
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFamiliar}
              className="text-xs border-info/30 text-info hover:bg-info/5"
            >
              <RotateCcw className="size-3.5 mr-1" />
              熟悉
            </Button>
            <Button
              size="sm"
              onClick={handleMastered}
              className="text-xs bg-success hover:bg-success/90"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              掌握
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goPrev} disabled={words.length <= 1}>
              <ChevronLeft className="size-4" /> 上一个
            </Button>
            <Button variant="ghost" size="sm" onClick={goNext} disabled={words.length <= 1}>
              下一个 <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
