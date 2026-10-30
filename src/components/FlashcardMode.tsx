'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, Category, UserProgress, ReviewRating } from '@/types';
import { playPronunciation } from '@/lib/speech';
import { fa } from '@/lib/format';
import { Icon } from './m3/Icon';
import { Button, IconButton } from './m3/Button';
import { SegmentedButton } from './m3/SegmentedButton';
import { LinearProgress } from './m3/Progress';
import { Shape } from './m3/Shape';

interface FlashcardModeProps {
  category: Category;
  words: Word[];
  progress: UserProgress;
  onReviewWord: (wordId: string, rating: ReviewRating) => void;
  onToggleBookmark: (wordId: string) => void;
  onChangeCategory: () => void;
}

type FilterMode = 'all' | 'need_review' | 'bookmarked';

function LeitnerDots({ box }: { box: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`جعبه ${fa(box)} از ${fa(5)}`}>
      {[1, 2, 3, 4, 5].map((b) => (
        <span
          key={b}
          className={`h-2 rounded-full transition-all duration-500 ease-spring ${b <= box ? 'w-4 bg-primary' : 'w-2 bg-outline-variant'}`}
        />
      ))}
    </span>
  );
}

export function FlashcardMode({ category, words, progress, onReviewWord, onToggleBookmark, onChangeCategory }: FlashcardModeProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [currentWordId, setCurrentWordId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  const bookmarkedSet = useMemo(() => new Set(progress.bookmarkedWords), [progress.bookmarkedWords]);

  const counts = useMemo(() => {
    let needReview = 0;
    let bookmarked = 0;
    for (const w of words) {
      const p = progress.learnedWords[w.id];
      if (!p || p.box <= 2) needReview++;
      if (bookmarkedSet.has(w.id)) bookmarked++;
    }
    return { all: words.length, needReview, bookmarked };
  }, [words, progress.learnedWords, bookmarkedSet]);

  const activeWords = useMemo(() => {
    if (filterMode === 'bookmarked') return words.filter((w) => bookmarkedSet.has(w.id));
    if (filterMode === 'need_review') {
      return words.filter((w) => {
        const p = progress.learnedWords[w.id];
        return !p || p.box <= 2;
      });
    }
    return words;
  }, [words, filterMode, bookmarkedSet, progress.learnedWords]);

  // Reset to the first card whenever the filter or category changes (adjusted during render).
  const resetKey = `${category.id}:${filterMode}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setCurrentWordId(null);
    setIsFlipped(false);
  }

  // The card is tracked by word id, so lists that shrink after a rating (need_review) never skip a card.
  const foundIndex = currentWordId ? activeWords.findIndex((w) => w.id === currentWordId) : -1;
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const currentWord: Word | undefined = activeWords[currentIndex];
  const wordProg = currentWord ? progress.learnedWords[currentWord.id] : undefined;
  const isBookmarked = currentWord ? bookmarkedSet.has(currentWord.id) : false;
  const boxNumber = wordProg?.box || 1;

  const speakCurrentWord = useCallback(() => {
    if (!currentWord) return;
    setIsPlayingAudio(true);
    playPronunciation(currentWord.word, () => setIsPlayingAudio(false));
  }, [currentWord]);

  // Auto-play pronunciation when a new card appears
  useEffect(() => {
    if (!autoPlayAudio || !currentWord) return;
    const timer = setTimeout(speakCurrentWord, 300);
    return () => clearTimeout(timer);
  }, [autoPlayAudio, currentWord, speakCurrentWord]);

  const goTo = useCallback(
    (index: number) => {
      if (activeWords.length === 0) return;
      const n = activeWords.length;
      setIsFlipped(false);
      setCurrentWordId(activeWords[((index % n) + n) % n].id);
    },
    [activeWords]
  );

  const handleNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const handlePrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  const handleRating = useCallback(
    (rating: ReviewRating) => {
      if (!currentWord) return;
      handleNext();
      onReviewWord(currentWord.id, rating);
    },
    [currentWord, handleNext, onReviewWord]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;
      if (document.querySelector('[role="dialog"]')) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        // Let focused controls (buttons, links, the card itself) handle their own activation
        if (target?.closest('button, a, [role="button"]')) return;
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1' || e.key === '۱') {
        handleRating('hard');
      } else if (e.key === '2' || e.key === '۲') {
        handleRating('medium');
      } else if (e.key === '3' || e.key === '۳') {
        handleRating('easy');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 's' || e.key === 'س') {
        speakCurrentWord();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRating, handleNext, handlePrev, speakCurrentWord]);

  const handleShuffle = () => {
    if (activeWords.length < 2) return;
    let next = currentIndex;
    while (next === currentIndex) next = Math.floor(Math.random() * activeWords.length);
    goTo(next);
  };

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <IconButton icon="arrow_forward" label="بازگشت به سرفصل‌ها" onClick={onChangeCategory} />
        <div className="min-w-0">
          <h2 className="truncate text-title-l text-on-surface">{category.title}</h2>
          <p className="text-body-s text-on-surface-variant">مرور با جعبه لایتنر</p>
        </div>
      </div>
      <SegmentedButton<FilterMode>
        ariaLabel="فیلتر کارت‌ها"
        value={filterMode}
        onChange={setFilterMode}
        className="w-full sm:w-auto"
        options={[
          { value: 'all', label: `همه · ${fa(counts.all)}` },
          { value: 'need_review', label: `برای مرور · ${fa(counts.needReview)}` },
          { value: 'bookmarked', label: `نشان‌شده · ${fa(counts.bookmarked)}` },
        ]}
      />
    </div>
  );

  if (!currentWord) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {header}
        <div className="flex flex-col items-center gap-5 rounded-shape-xl bg-surface-container-low px-6 py-16 text-center animate-rise-in">
          <Shape kind={filterMode === 'bookmarked' ? 'cookie9' : 'burst'} size={112} className="text-tertiary-container" spin>
            <Icon name={filterMode === 'bookmarked' ? 'star' : 'celebration'} size={44} className="text-on-tertiary-container" />
          </Shape>
          <div>
            <h3 className="text-headline-s text-on-surface">
              {filterMode === 'bookmarked' ? 'هنوز واژه‌ای نشان نکرده‌اید' : 'آفرین! همه واژه‌ها مرور شده‌اند'}
            </h3>
            <p className="mt-2 text-body-m text-on-surface-variant">
              {filterMode === 'bookmarked'
                ? 'با ستاره روی هر کارت، واژه‌های مهم را برای مرور جداگانه نشان کنید.'
                : 'همه واژه‌های این سرفصل در جعبه‌های بالای لایتنر هستند.'}
            </p>
          </div>
          <Button variant="tonal" icon="style" onClick={() => setFilterMode('all')}>
            نمایش همه کارت‌ها
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {header}

      {/* Session progress + tools */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-label-l text-on-surface tabular-nums">
          {fa(currentIndex + 1)} <span className="text-on-surface-variant">از {fa(activeWords.length)}</span>
        </span>
        <LinearProgress value={(currentIndex + 1) / activeWords.length} label="پیشرفت جلسه مرور" wavy className="flex-1" />
        <IconButton
          icon={autoPlayAudio ? 'volume_up' : 'volume_off'}
          label={autoPlayAudio ? 'خاموش کردن تلفظ خودکار' : 'روشن کردن تلفظ خودکار'}
          selected={autoPlayAudio}
          onClick={() => setAutoPlayAudio((v) => !v)}
        />
        <IconButton icon="shuffle" label="کارت تصادفی" onClick={handleShuffle} />
      </div>

      {/* 3D flip card */}
      {/* Keyed by word: a new card mounts face-up, so the next word's meaning is never shown while flipping back */}
      <div key={currentWord.id} className="perspective-1200 animate-card-in">
        <div
          role="button"
          tabIndex={0}
          aria-label={isFlipped ? 'نمایش روی کارت' : 'نمایش معنی واژه'}
          aria-pressed={isFlipped}
          onClick={() => setIsFlipped((v) => !v)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
              e.preventDefault();
              e.stopPropagation();
              setIsFlipped((v) => !v);
            }
          }}
          className={`relative min-h-[360px] cursor-pointer select-none rounded-shape-xl transform-style-3d flip-spring sm:min-h-[400px] ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 flex flex-col overflow-hidden rounded-shape-xl bg-surface-container-high p-5 backface-hidden sm:p-8 ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            <Shape kind="cookie12" size={320} className="pointer-events-none absolute -bottom-36 -start-28 text-surface-container-highest" />

            <div className="relative flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-3 py-1.5 text-label-m text-on-surface-variant">
                <span>جعبه {fa(boxNumber)}</span>
                <LeitnerDots box={boxNumber} />
              </span>
              <IconButton
                icon="star"
                label={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان کردن این واژه'}
                selected={isBookmarked}
                className={isBookmarked ? '!text-flame' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(currentWord.id);
                }}
              />
            </div>

            <div className="relative my-auto flex flex-col items-center gap-5 py-6 text-center">
              <h3
                key={currentWord.id}
                dir="ltr"
                className="latin max-w-full break-words text-display-s font-bold text-on-surface animate-pop-in sm:text-display-m"
              >
                {currentWord.word}
              </h3>
              {currentWord.phonetic && <p className="latin text-body-l text-on-surface-variant">{currentWord.phonetic}</p>}
              <Button
                variant="tonal"
                icon="volume_up"
                iconFilled={isPlayingAudio}
                className={isPlayingAudio ? '!bg-primary !text-on-primary' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  speakCurrentWord();
                }}
              >
                تلفظ
              </Button>
            </div>

            <p className="relative flex items-center justify-center gap-2 text-body-s text-on-surface-variant">
              <Icon name="touch_app" size={18} />
              برای دیدن معنی روی کارت بزنید
            </p>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 flex flex-col overflow-hidden rounded-shape-xl bg-secondary-container p-5 text-on-secondary-container backface-hidden rotate-y-180 sm:p-8 ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            <Shape kind="clover8" size={260} className="pointer-events-none absolute -end-24 -top-24 text-on-secondary-container opacity-[0.06]" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1">
                <span dir="ltr" className="latin truncate text-title-l font-bold">
                  {currentWord.word}
                </span>
                <IconButton
                  icon="volume_up"
                  label="پخش تلفظ"
                  className="!text-on-secondary-container"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakCurrentWord();
                  }}
                />
              </div>
              <LeitnerDots box={boxNumber} />
            </div>

            <div className="relative my-auto max-h-[240px] overflow-y-auto py-4">
              <p className="mb-3 text-label-l opacity-80">معنی‌ها</p>
              <ol className="space-y-3">
                {currentWord.meanings.map((meaning, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-title-l leading-[1.6]">
                    <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-on-secondary-container text-label-l text-secondary-container">
                      {fa(idx + 1)}
                    </span>
                    <span>{meaning}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="relative text-center text-body-s opacity-80">چقدر این واژه را بلد بودید؟</p>
          </div>
        </div>
      </div>

      {/* Actions: reveal first, then rate (progressive disclosure) */}
      {isFlipped ? (
        <div className="grid grid-cols-3 gap-2 animate-rise-in" role="group" aria-label="ارزیابی میزان تسلط">
          <Button variant="error" size="md" icon="close" className="!px-3" onClick={() => handleRating('hard')}>
            بلد نبودم
          </Button>
          <Button variant="tonal" size="md" icon="help" className="!px-3" onClick={() => handleRating('medium')}>
            شک داشتم
          </Button>
          <Button variant="success" size="md" icon="check" className="!px-3" onClick={() => handleRating('easy')}>
            بلدم
          </Button>
        </div>
      ) : (
        <Button size="md" icon="visibility" fullWidth onClick={() => setIsFlipped(true)}>
          نمایش معنی
        </Button>
      )}

      <div className="flex items-center justify-between">
        <Button variant="text" icon="chevron_right" onClick={handlePrev}>
          قبلی
        </Button>
        <p className="hidden items-center gap-2 text-body-s text-on-surface-variant [@media(hover:hover)]:flex">
          <Icon name="keyboard" size={18} />
          Space چرخش · ۱ ۲ ۳ ارزیابی · S تلفظ
        </p>
        <Button variant="text" trailingIcon="chevron_left" onClick={handleNext}>
          بعدی
        </Button>
      </div>
    </div>
  );
}
