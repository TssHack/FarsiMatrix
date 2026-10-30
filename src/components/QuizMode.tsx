'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Word, Category, UserProgress } from '@/types';
import { playPronunciation } from '@/lib/speech';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  Trophy,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface QuizModeProps {
  category: Category;
  words: Word[];
  progress: UserProgress;
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

export function QuizMode({
  category,
  words,
  progress,
  onRecordQuizCompletion,
  onStartFlashcard,
  onChangeCategory,
}: QuizModeProps) {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [direction, setDirection] = useState<'en_to_fa' | 'fa_to_en'>('en_to_fa');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<{ question: string; correct: string; chosen: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Generate randomized questions from available words
  const generateQuestions = useCallback(() => {
    if (!words || words.length < 4) return [];

    // Shuffle words
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, words.length));

    return selected.map((item) => {
      const isEnToFa = direction === 'en_to_fa';
      const question = isEnToFa ? item.word : item.meanings[0];
      const answer = isEnToFa ? item.meanings[0] : item.word;

      // Pick 3 random distractor words from other items
      const distractors: string[] = [];
      const others = words.filter((w) => w.id !== item.id).sort(() => 0.5 - Math.random());

      for (const other of others) {
        const dist = isEnToFa ? other.meanings[0] : other.word;
        if (dist && dist !== answer && !distractors.includes(dist)) {
          distractors.push(dist);
        }
        if (distractors.length >= 3) break;
      }

      // Combine and shuffle options
      const options = [answer, ...distractors].sort(() => 0.5 - Math.random());

      return {
        wordId: item.id,
        question,
        answer,
        options,
        audioText: isEnToFa ? item.word : undefined,
      };
    });
  }, [words, questionCount, direction]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Start new quiz
  const startQuiz = () => {
    const q = generateQuestions();
    setQuestions(q);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setWrongAnswers([]);
    setIsFinished(false);
    setIsPlaying(true);
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(option);

    const isCorrect = option === currentQ.answer;
    let nextScore = score;
    if (isCorrect) {
      nextScore = score + 1;
      setScore(nextScore);
    } else {
      setWrongAnswers((prev) => [
        ...prev,
        { question: currentQ.question, correct: currentQ.answer, chosen: option },
      ]);
    }

    // Move to next question after small delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        // Quiz completed
        setIsFinished(true);
        onRecordQuizCompletion(questions.length, nextScore);

        // Confetti celebration if score > 50%
        if (nextScore / questions.length >= 0.5) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {
            // ignore
          }
        }
      }
    }, 1100);
  };

  // Setup Screen (before quiz starts)
  if (!isPlaying || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              onClick={onChangeCategory}
              className="text-xs font-semibold cursor-pointer hover:underline"
              style={{ color: 'var(--md-sys-color-primary)' }}
            >
              سرفصل‌ها
            </span>
            <span className="text-xs opacity-50">/</span>
            <span className="text-xs font-bold">{category.title}</span>
          </div>
          <h2 className="text-2xl font-black">آزمون و تست چهارگزینه‌ای</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            مهارت و حافظه خود را با کوئیز هوشمند بسنجید.
          </p>
        </div>

        <div
          className="rounded-3xl p-6 sm:p-8 border space-y-6 shadow-sm"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-bold mb-2 block">جهت آزمون:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDirection('en_to_fa')}
                className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  direction === 'en_to_fa' ? 'shadow-xs' : 'opacity-70'
                }`}
                style={{
                  backgroundColor:
                    direction === 'en_to_fa'
                      ? 'var(--md-sys-color-primary-container)'
                      : 'var(--md-sys-color-surface-container)',
                  color:
                    direction === 'en_to_fa'
                      ? 'var(--md-sys-color-on-primary-container)'
                      : 'var(--md-sys-color-on-surface-variant)',
                  borderColor:
                    direction === 'en_to_fa'
                      ? 'var(--md-sys-color-primary)'
                      : 'var(--md-sys-color-outline-variant)',
                }}
              >
                انگلیسی به فارسی 🇬🇧 ➔ 🇮🇷
              </button>

              <button
                onClick={() => setDirection('fa_to_en')}
                className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  direction === 'fa_to_en' ? 'shadow-xs' : 'opacity-70'
                }`}
                style={{
                  backgroundColor:
                    direction === 'fa_to_en'
                      ? 'var(--md-sys-color-primary-container)'
                      : 'var(--md-sys-color-surface-container)',
                  color:
                    direction === 'fa_to_en'
                      ? 'var(--md-sys-color-on-primary-container)'
                      : 'var(--md-sys-color-on-surface-variant)',
                  borderColor:
                    direction === 'fa_to_en'
                      ? 'var(--md-sys-color-primary)'
                      : 'var(--md-sys-color-outline-variant)',
                }}
              >
                فارسی به انگلیسی 🇮🇷 ➔ 🇬🇧
              </button>
            </div>
          </div>

          {/* Number of questions */}
          <div>
            <label className="text-xs font-bold mb-2 block">تعداد سوالات:</label>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`flex-1 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    questionCount === num ? 'shadow-xs' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor:
                      questionCount === num
                        ? 'var(--md-sys-color-secondary-container)'
                        : 'transparent',
                    color:
                      questionCount === num
                        ? 'var(--md-sys-color-on-secondary-container)'
                        : 'var(--md-sys-color-on-surface-variant)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                >
                  {num} سوال
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startQuiz}
            className="w-full py-4 rounded-full text-sm font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
            }}
          >
            <Sparkles className="w-5 h-5" />
            <span>شروع آزمون ({questionCount} سوال)</span>
          </button>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20">
        <div
          className="rounded-3xl p-8 sm:p-10 border text-center space-y-6 shadow-md"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-sm"
            style={{
              backgroundColor:
                accuracy >= 70
                  ? 'var(--md-sys-color-success-container)'
                  : 'var(--md-sys-color-primary-container)',
              color:
                accuracy >= 70
                  ? 'var(--md-sys-color-on-success-container)'
                  : 'var(--md-sys-color-on-primary-container)',
            }}
          >
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">نتیجه آزمون شما</h2>
            <p className="text-xs" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              سرفصل: {category.title}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
            <div>
              <span className="text-xs opacity-70 block mb-1">پاسخ‌های درست</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {score}
              </span>
            </div>
            <div>
              <span className="text-xs opacity-70 block mb-1">پاسخ‌های غلط</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {questions.length - score}
              </span>
            </div>
            <div>
              <span className="text-xs opacity-70 block mb-1">دقت پاسخگویی</span>
              <span className="text-2xl font-black" style={{ color: 'var(--md-sys-color-primary)' }}>
                {accuracy}%
              </span>
            </div>
          </div>

          {/* Wrong answers review if any */}
          {wrongAnswers.length > 0 && (
            <div className="text-right space-y-3">
              <span className="text-xs font-bold block opacity-70">
                مرور سوالاتی که اشتباه پاسخ داده شد ({wrongAnswers.length}):
              </span>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {wrongAnswers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border text-xs flex justify-between items-center"
                    style={{
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                    }}
                  >
                    <div>
                      <span className="font-extrabold block text-sm dir-ltr text-ltr mb-0.5">
                        {item.question}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        پاسخ درست: {item.correct}
                      </span>
                    </div>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      انتخاب شما: {item.chosen}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={startQuiz}
              className="flex-1 py-3 rounded-full text-xs font-bold border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-center gap-2"
              style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>تکرار آزمون مجدد</span>
            </button>

            <button
              onClick={onStartFlashcard}
              className="flex-1 py-3 rounded-full text-xs font-bold shadow-xs hover:shadow-sm cursor-pointer flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>مرور لغات در فلش‌کارت</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Question Screen
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Top Question Progress */}
      <div className="flex items-center justify-between text-xs font-bold">
        <span>
          سوال {currentIndex + 1} از {questions.length}
        </span>
        <div className="w-40 sm:w-64 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              backgroundColor: 'var(--md-sys-color-primary)',
            }}
          />
        </div>
        <span className="text-emerald-600 dark:text-emerald-400">امتیاز: {score}</span>
      </div>

      {/* Question Card (M3 Elevated Card) */}
      <div
        className="rounded-3xl p-6 sm:p-10 border text-center shadow-sm space-y-4"
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full inline-block"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          {direction === 'en_to_fa' ? 'معنی فارسی صحیح کدام است؟' : 'معادل انگلیسی صحیح کدام است؟'}
        </span>

        <h3 className="text-2xl sm:text-4xl font-black py-2 dir-ltr text-ltr tracking-wide">
          {currentQ.question}
        </h3>

        {currentQ.audioText && (
          <div className="flex justify-center">
            <button
              onClick={() => playPronunciation(currentQ.audioText!)}
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-teal-600 dark:text-teal-400"
              title="شنیدن تلفظ"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* 4 Choices Grid (M3 Buttons with state transitions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((option, idx) => {
          let btnBg = 'var(--md-sys-color-surface-container-low)';
          let btnColor = 'var(--md-sys-color-on-surface)';
          let btnBorder = 'var(--md-sys-color-outline-variant)';

          if (selectedOption !== null) {
            if (option === currentQ.answer) {
              btnBg = 'var(--md-sys-color-success-container)';
              btnColor = 'var(--md-sys-color-on-success-container)';
              btnBorder = 'var(--md-sys-color-success)';
            } else if (option === selectedOption) {
              btnBg = 'var(--md-sys-color-error-container)';
              btnColor = 'var(--md-sys-color-on-error-container)';
              btnBorder = 'var(--md-sys-color-error)';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(option)}
              disabled={selectedOption !== null}
              className={`p-4 rounded-2xl text-sm sm:text-base font-bold border transition-all text-right flex items-center justify-between shadow-xs cursor-pointer ${
                selectedOption === null ? 'hover:scale-[1.02] active:scale-98' : ''
              }`}
              style={{
                backgroundColor: btnBg,
                color: btnColor,
                borderColor: btnBorder,
              }}
            >
              <span className="flex-1 leading-relaxed">{option}</span>
              {selectedOption !== null && option === currentQ.answer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mr-2" />
              )}
              {selectedOption === option && option !== currentQ.answer && (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mr-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
