import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Headphones,
  MessageCircle,
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  GraduationCap,
  Pencil,
} from 'lucide-react';
import { MOCK_ENGLISH_DAYS } from '@/data/english';
import { MOCK_ENGLISH_ANSWERS } from '@/data/englishAnswers';
import SpeechControls from '@/components/SpeechControls';
import { useSpeech } from '@/hooks/useSpeech';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EnglishDetailPanelProps {
  day: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onDayChange: (day: number) => void;
}

function WordList({ words }: { words: { word: string; phonetic: string; pos?: string; meaning: string; example?: string; exampleCn?: string }[] }) {
  const { speak, isSpeaking } = useSpeech();

  return (
    <div className="space-y-2">
      {words.map((w, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors group"
        >
          <button
            onClick={() => speak(w.word)}
            className="size-7 rounded-md bg-card border border-border/60 flex items-center justify-center shrink-0 hover:bg-primary/10 hover:border-primary/30 transition-colors"
            aria-label={`朗读 ${w.word}`}
          >
            <Volume2 className={`size-3.5 ${isSpeaking ? 'text-primary' : 'text-muted-foreground'}`} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm">{w.word}</span>
              <span className="text-xs text-muted-foreground font-mono">{w.phonetic}</span>
              <span className="text-xs text-primary/80">{w.pos}</span>
            </div>
            <p className="text-xs text-foreground/75 mt-0.5">{w.meaning}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadingSection({ reading, day }: { reading: any; day: number }) {
  const answers = MOCK_ENGLISH_ANSWERS[day];
  const { speak } = useSpeech();
  const [showQuiz, setShowQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correct = answers.readingQuiz.filter(
      (q: any, i: number) => userAnswers[i] === q.answerIndex,
    ).length;
    toast.success(`答对 ${correct}/${answers.readingQuiz.length} 题！`);
  };

  const fullText = reading?.paragraphs?.map((p: any) => p.en).join(' ') || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{reading.title}</h4>
          <p className="text-xs text-muted-foreground">来源：{reading.source}</p>
        </div>
        <SpeechControls text={fullText} />
      </div>

      <div className="space-y-3 text-sm leading-relaxed">
        {reading.paragraphs?.map((p: any, i: number) => (
          <div key={i} className="space-y-1.5">
            <p className="text-foreground/90">{p.en}</p>
            <p className="text-xs text-muted-foreground">{p.zh}</p>
          </div>
        ))}
      </div>

      {answers?.readingQuiz && answers.readingQuiz.length > 0 && (
        <div className="pt-3 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuiz((v) => !v)}
            className="w-full justify-center gap-1.5"
          >
            <Pencil className="size-3.5" />
            {showQuiz ? '收起阅读理解练习' : '做阅读理解练习'}
          </Button>

          <AnimatePresence>
            {showQuiz && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  {answers.readingQuiz.map((q: any, qi: number) => (
                    <div key={qi} className="p-3 rounded-lg bg-card border border-border/50">
                      <p className="text-sm font-medium text-foreground mb-2.5">
                        {qi + 1}. {q.question}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt: string, oi: number) => {
                          const isSelected = userAnswers[qi] === oi;
                          const isCorrect = showResults && oi === q.answerIndex;
                          const isWrong = showResults && isSelected && oi !== q.answerIndex;
                          return (
                            <button
                              key={oi}
                              onClick={() => handleSelect(qi, oi)}
                              className={cn(
                                'w-full text-left px-3 py-2 rounded-md text-xs transition-colors border',
                                isCorrect
                                  ? 'bg-success/10 border-success/30 text-success-foreground'
                                  : isWrong
                                  ? 'bg-destructive/10 border-destructive/30 text-destructive'
                                  : isSelected
                                  ? 'bg-primary/10 border-primary/30 text-primary'
                                  : 'bg-muted/20 border-transparent hover:bg-muted/40',
                              )}
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                            </button>
                          );
                        })}
                      </div>
                      {showResults && (
                        <div className="mt-2.5 pt-2 border-t border-border/40">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">解析：</span>
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {!showResults && (
                    <Button size="sm" onClick={checkAnswers} className="w-full">
                      提交答案
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SpeakingSection({ speaking, day }: { speaking: any; day: number }) {
  const answers = MOCK_ENGLISH_ANSWERS[day];
  const { speak } = useSpeech();
  const [showSamples, setShowSamples] = useState(false);

  const allDialogue = speaking?.dialogueEn?.join(' ') || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-sm font-semibold text-foreground">口语表达训练</h4>
        <SpeechControls text={allDialogue} />
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">常用表达</p>
        <div className="space-y-1.5">
          {speaking.expressions?.map((exp: any, i: number) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 p-2.5 rounded-md bg-muted/30 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium">{exp.en}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{exp.zh}</p>
              </div>
              <button
                onClick={() => speak(exp.en)}
                className="size-7 rounded-md bg-card border border-border/60 flex items-center justify-center shrink-0 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                aria-label="朗读"
              >
                <Volume2 className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          对话场景：{speaking.dialogueContext}
        </p>
        <div className="p-3 rounded-lg bg-card border border-border/50 space-y-2">
          {speaking.dialogueEn?.map((line: string, i: number) => (
            <div key={i} className="text-sm">
              <span className="text-xs text-muted-foreground font-mono mr-2">
                {line.startsWith('A:') ? 'A' : 'B'}
              </span>
              <span className="text-foreground/90">{line.replace(/^[AB]:\s*/, '')}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 p-3 rounded-lg bg-muted/20 space-y-1.5">
          {speaking.dialogueZh?.map((line: string, i: number) => (
            <p key={i} className="text-xs text-muted-foreground">{line}</p>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-info/5 border border-info/20">
        <div className="flex items-start gap-2">
          <GraduationCap className="size-4.5 text-info shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-info mb-1">今日口语任务</p>
            <p className="text-sm text-foreground/85">{speaking.task}</p>
          </div>
        </div>
      </div>

      {answers?.speakingSamples && answers.speakingSamples.length > 0 && (
        <div className="pt-3 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSamples((v) => !v)}
            className="w-full justify-center gap-1.5"
          >
            <Lightbulb className="size-3.5" />
            {showSamples ? '收起参考表达' : '查看更多参考表达'}
          </Button>
          <AnimatePresence>
            {showSamples && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-1.5">
                  {answers.speakingSamples.map((s: string, i: number) => {
                    const [en, zh] = s.split(' | ');
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/30"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{en}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{zh}</p>
                        </div>
                        <button
                          onClick={() => speak(en)}
                          className="size-6 rounded-md bg-card border border-border/60 flex items-center justify-center shrink-0 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                          aria-label="朗读"
                        >
                          <Volume2 className="size-3 text-muted-foreground" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function EnglishDetailPanel({
  day,
  isCompleted,
  onToggleComplete,
  onDayChange,
}: EnglishDetailPanelProps) {
  const data = MOCK_ENGLISH_DAYS.find((d) => d.day === day);

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          暂无第{day}天英语数据
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            第{day}天 / 30天
          </Badge>
          <Badge variant="secondary" className="text-xs">
            第{data.week}周 · {data.category}
          </Badge>
          {isCompleted && (
            <Badge className="bg-success/15 text-success border-success/20">
              <CheckCircle2 className="size-3 mr-1" />
              已完成
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant={isCompleted ? 'outline' : 'default'}
          onClick={onToggleComplete}
          className="gap-1.5"
        >
          {isCompleted ? (
            <>
              <EyeOff className="size-4" />
              标记未完成
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              标记已完成
            </>
          )}
        </Button>
      </div>

      <Card className="border-info/20 bg-info/[0.02]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80">主题：{data.theme}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-5 text-foreground/70" />
            核心词汇（{data.vocabulary?.length || 0}个）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WordList words={data.vocabulary || []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Headphones className="size-5 text-foreground/70" />
            阅读理解
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReadingSection reading={data.reading} day={day} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="size-5 text-foreground/70" />
            口语练习
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpeakingSection speaking={data.speaking} day={day} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={() => onDayChange(day - 1)} disabled={day <= 1} size="sm">
          <ChevronLeft className="size-4 mr-1" />
          上一天
        </Button>
        <span className="text-xs text-muted-foreground">第{day}天 / 共30天</span>
        <Button variant="outline" onClick={() => onDayChange(day + 1)} disabled={day >= 30} size="sm">
          下一天
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
