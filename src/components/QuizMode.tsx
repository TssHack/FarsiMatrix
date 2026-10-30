'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Word, Category } from '@/types';
import { playPronunciation } from '@/lib/speech';
import { fa, faPercent } from '@/lib/format';
import { Icon } from './m3/Icon';
import { Button, IconButton } from './m3/Button';
import { SegmentedButton } from './m3/SegmentedButton';
import { FilterChip, Tag } from './m3/Chip';
import { LinearProgress, CircularProgress } from './m3/Progress';
import { Shape } from './m3/Shape';

interface QuizModeProps {
  category: Category;
  words: Word[];
  onRecordQuizCompletion: (total: number, correct: number) => void;
  onStartFlashcard: () => void;
  onChangeCategory: () => void;
}

interface QuizQuestion {
  wordId: string;
  question: string;
  answer: string;
  options: string[];
  audioText?: string;
}

type Direction = 'en_to_fa' | 'fa_to_en';

const OPTION_LABELS = ['الف', 'ب', 'ج', 'د'];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuestions(words: Word[], count: number, direction: Direction): QuizQuestion[] {
  if (words.length < 4) return [];
  const selected = shuffle(words).slice(0, Math.min(count, words.length));
  const isEnToFa = direction === 'en_to_fa';
  return selected.map((item) => {
    const answer = isEnToFa ? item.meanings[0] : item.word;
    const distractors: string[] = [];
    for (const other of shuffle(words)) {
      if (other.id === item.id) continue;
      const d = isEnToFa ? other.meanings[0] : other.word;
      if (d && d !== answer && !distractors.includes(d)) distractors.push(d);
      if (distractors.length >= 3) break;
    }
    return {
      wordId: item.id,
      question: isEnToFa ? item.word : item.meanings[0],
      answer,
      options: shuffle([answer, ...distractors]),
      audioText: item.word,
    };
  });
}

function themeColors(): string[] {
  const style = getComputedStyle(document.documentElement);
  return ['primary', 'tertiary', 'secondary', 'primary-container', 'tertiary-container'].map((n) =>
    style.getPropertyValue(`--md-sys-color-${n}`).trim()
  );
}

export function QuizMode({ category, words, onRecordQuizCompletion, onStartFlashcard, onChangeCategory }: QuizModeProps) {
  const [questionCount, setQuestionCount] = useState(10);
  const [direction, setDirection] = useState<Direction>('en_to_fa');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<{ question: string; correct: string; chosen: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const isPlaying = questions.length > 0;
  const currentQ = questions[currentIndex];

  const startQuiz = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setQuestions(buildQuestions(words, questionCount, direction));
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setWrongAnswers([]);
    setIsFinished(false);
  };

  const handleSelectOption = useCallback(
    (option: string) => {
      if (selectedOption !== null || !currentQ) return;
      setSelectedOption(option);
      const isCorrect = option === currentQ.answer;
      const nextScore = isCorrect ? score + 1 : score;
      if (isCorrect) setScore(nextScore);
      else setWrongAnswers((prev) => [...prev, { question: currentQ.question, correct: currentQ.answer, chosen: option }]);

      advanceTimer.current = setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
          return;
        }
        setIsFinished(true);
        onRecordQuizCompletion(questions.length, nextScore);
        if (nextScore / questions.length >= 0.6 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: themeColors() });
        }
      }, 1100);
    },
    [selectedOption, currentQ, score, currentIndex, questions.length, onRecordQuizCompletion]
  );

  // Keyboard: 1-4 to answer
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '۱': 0, '۲': 1, '۳': 2, '۴': 3 };
      const idx = map[e.key];
      if (idx !== undefined && currentQ?.options[idx]) handleSelectOption(currentQ.options[idx]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying, isFinished, currentQ, handleSelectOption]);

  const header = (
    <div className="flex items-center gap-2">
      <IconButton icon="arrow_forward" label="بازگشت به سرفصل‌ها" onClick={onChangeCategory} />
      <div className="min-w-0">
        <h2 className="truncate text-title-l text-on-surface">آزمون چهارگزینه‌ای</h2>
        <p className="truncate text-body-s text-on-surface-variant">{category.title}</p>
      </div>
    </div>
  );

  // Setup
  if (!isPlaying) {
    const tooFew = words.length < 4;
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {header}
        <div className="overflow-hidden rounded-shape-xl bg-surface-container-low animate-rise-in">
          <div className="relative flex flex-col items-center gap-3 bg-tertiary-container px-6 pb-8 pt-10 text-center text-on-tertiary-container">
            <Shape kind="softBurst" size={96} className="text-tertiary" spin>
              <Icon name="quiz" size={44} filled className="text-on-tertiary" />
            </Shape>
            <h3 className="text-headline-s font-bold">مهارتت را بسنج!</h3>
            <p className="max-w-md text-body-m opacity-90">واژه‌ها به‌صورت تصادفی انتخاب می‌شوند و بعد از هر پاسخ، درست یا غلط بودن را می‌بینی.</p>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <p className="mb-3 text-title-s text-on-surface">جهت آزمون</p>
              <SegmentedButton<Direction>
                ariaLabel="جهت آزمون"
                value={direction}
                onChange={setDirection}
                options={[
                  { value: 'en_to_fa', label: 'انگلیسی ← فارسی' },
                  { value: 'fa_to_en', label: 'فارسی ← انگلیسی' },
                ]}
              />
            </div>

            <div>
              <p className="mb-3 text-title-s text-on-surface">تعداد سؤال</p>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 20, 30].map((n) => (
                  <FilterChip key={n} label={`${fa(n)} سؤال`} selected={questionCount === n} onClick={() => setQuestionCount(n)} />
                ))}
              </div>
            </div>

            <Button size="md" icon="play_arrow" iconFilled fullWidth onClick={startQuiz} disabled={tooFew}>
              شروع آزمون
            </Button>
            {tooFew && <p className="text-center text-body-s text-error">برای ساخت آزمون دست‌کم ۴ واژه لازم است.</p>}
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (isFinished) {
    const ratio = score / questions.length;
    const verdict =
      ratio >= 0.9 ? 'فوق‌العاده بود!' : ratio >= 0.7 ? 'عالی بود!' : ratio >= 0.5 ? 'خوب بود، ادامه بده!' : 'نیاز به مرور بیشتر';
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {header}
        <div className="flex flex-col items-center gap-6 rounded-shape-xl bg-surface-container-low px-6 py-10 text-center animate-rise-in">
          <CircularProgress
            value={ratio}
            size={168}
            thickness={14}
            label="دقت پاسخ‌ها"
            indicatorClassName={ratio >= 0.5 ? 'text-success' : 'text-error'}
          >
            <span className="flex flex-col items-center">
              <span className="text-display-s font-bold text-on-surface">{faPercent(ratio)}</span>
              <span className="text-label-m text-on-surface-variant">دقت</span>
            </span>
          </CircularProgress>

          <div>
            <h3 className="text-headline-m font-bold text-on-surface">{verdict}</h3>
            <p className="mt-1 text-body-m text-on-surface-variant">
              {fa(score)} پاسخ درست از {fa(questions.length)} سؤال
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Tag icon="check_circle" tone="success">
              {fa(score)} درست
            </Tag>
            <Tag icon="cancel" tone="error">
              {fa(questions.length - score)} نادرست
            </Tag>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="w-full text-start">
              <p className="mb-2 text-title-s text-on-surface">مرور اشتباه‌ها</p>
              <ul className="max-h-72 divide-y divide-outline-variant overflow-y-auto rounded-shape-lg bg-surface-container">
                {wrongAnswers.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 px-4 py-3">
                    <Icon name="cancel" size={20} className="mt-0.5 text-error" />
                    <div className="min-w-0 flex-1">
                      <p className="text-body-l text-on-surface" dir="auto">
                        {item.question}
                      </p>
                      <p className="text-body-m text-success" dir="auto">
                        پاسخ درست: {item.correct}
                      </p>
                      <p className="text-body-s text-on-surface-variant line-through" dir="auto">
                        {item.chosen}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="outlined" size="md" icon="restart_alt" className="flex-1" onClick={startQuiz}>
              آزمون دوباره
            </Button>
            <Button size="md" icon="style" className="flex-1" onClick={onStartFlashcard}>
              مرور با فلش‌کارت
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Question
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {header}

      <div className="flex items-center gap-3">
        <span className="shrink-0 text-label-l text-on-surface">
          سؤال {fa(currentIndex + 1)} <span className="text-on-surface-variant">از {fa(questions.length)}</span>
        </span>
        <LinearProgress value={(currentIndex + (selectedOption ? 1 : 0)) / questions.length} label="پیشرفت آزمون" className="flex-1" />
        <Tag icon="emoji_events" tone="tertiary">
          {fa(score)}
        </Tag>
      </div>

      <div key={currentIndex} className="relative overflow-hidden rounded-shape-xl bg-surface-container-high px-6 py-10 text-center animate-rise-in">
        <Shape kind="flower" size={220} className="pointer-events-none absolute -end-20 -top-24 text-surface-container-highest" />
        <p className="relative text-label-l text-on-surface-variant">
          {direction === 'en_to_fa' ? 'معنی درست کدام است؟' : 'معادل انگلیسی کدام است؟'}
        </p>
        <h3 dir="auto" className={`relative mt-3 break-words font-bold text-on-surface ${direction === 'en_to_fa' ? 'latin text-display-s' : 'text-headline-m'}`}>
          {currentQ.question}
        </h3>
        {direction === 'en_to_fa' && currentQ.audioText && (
          <div className="relative mt-4 flex justify-center">
            <IconButton icon="volume_up" variant="tonal" label="پخش تلفظ" onClick={() => playPronunciation(currentQ.audioText!)} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="گزینه‌ها">
        {currentQ.options.map((option, idx) => {
          const answered = selectedOption !== null;
          const isAnswer = option === currentQ.answer;
          const isChosen = option === selectedOption;
          let tone = 'bg-surface-container-low text-on-surface border border-outline-variant';
          let badge = 'bg-surface-container-highest text-on-surface-variant';
          let trailing: string | null = null;
          if (answered && isAnswer) {
            tone = 'bg-success-container text-on-success-container border border-transparent';
            badge = 'bg-success text-on-success';
            trailing = 'check_circle';
          } else if (answered && isChosen) {
            tone = 'bg-error-container text-on-error-container border border-transparent';
            badge = 'bg-error text-on-error';
            trailing = 'cancel';
          } else if (answered) {
            tone = 'bg-surface-container-low text-on-surface/50 border border-outline-variant/50';
          }
          return (
            <button
              key={idx}
              type="button"
              data-ripple
              disabled={answered}
              onClick={() => handleSelectOption(option)}
              className={`state-layer flex min-h-16 items-center gap-3 rounded-shape-lg px-4 py-3 text-start transition-[background-color,color,transform] duration-300 ease-spring cursor-pointer disabled:cursor-default ${tone} ${
                answered && (isAnswer || isChosen) ? 'scale-[1.02]' : ''
              }`}
            >
              <span className={`relative z-[2] grid h-8 w-8 shrink-0 place-items-center rounded-full text-label-l ${badge}`}>
                {OPTION_LABELS[idx]}
              </span>
              <span dir="auto" className={`relative z-[2] flex-1 text-body-l ${direction === 'fa_to_en' ? 'latin text-start' : ''}`}>
                {option}
              </span>
              {trailing && <Icon name={trailing} filled className="relative z-[2] animate-pop-in" />}
            </button>
          );
        })}
      </div>
      <p className="hidden text-center text-body-s text-on-surface-variant [@media(hover:hover)]:block">کلیدهای ۱ تا ۴ برای انتخاب گزینه</p>
    </div>
  );
}
