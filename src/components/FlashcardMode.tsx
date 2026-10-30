'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Word, Category, UserProgress, ReviewRating } from '@/types';
import { playPronunciation } from '@/lib/speech';
import { 
  Volume2, 
  RotateCw, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Shuffle, 
  Sparkles,
  CheckCircle,
  HelpCircle,
  Layers,
  VolumeX,
  Volume1,
  BookOpen
} from 'lucide-react';

interface FlashcardModeProps {
  category: Category;
  words: Word[];
  progress: UserProgress;
  onReviewWord: (wordId: string, rating: ReviewRating) => void;
  onToggleBookmark: (wordId: string) => void;
  onChangeCategory: () => void;
}

export function FlashcardMode({
  category,
  words,
  progress,
  onReviewWord,
  onToggleBookmark,
  onChangeCategory,
}: FlashcardModeProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'need_review' | 'bookmarked'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const pendingNextWordIdRef = useRef<string | null>(null);

  // Filter words
  const activeWords = useMemo(() => {
    if (filterMode === 'bookmarked') {
      const bookmarkedSet = new Set(progress.bookmarkedWords);
      return words.filter((w) => bookmarkedSet.has(w.id));
    }
    if (filterMode === 'need_review') {
      return words.filter((w) => {
        const p = progress.learnedWords[w.id];
        return !p || p.box <= 2;
      });
    }
    return words;
  }, [words, filterMode, progress.bookmarkedWords, progress.learnedWords]);

  // Reset to the first card whenever the filter or category changes. Adjusted during
  // render (React's recommended pattern) instead of in an effect, to avoid an extra render pass.
  const resetKey = `${category.id}:${filterMode}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  const currentWord: Word | undefined = activeWords[currentIndex];
  const wordProg = currentWord ? progress.learnedWords[currentWord.id] : undefined;
  const isBookmarked = currentWord ? progress.bookmarkedWords.includes(currentWord.id) : false;

  // Speak word
  const speakCurrentWord = useCallback(() => {
    if (!currentWord) return;
    setIsPlayingAudio(true);
    playPronunciation(currentWord.word, () => {
      setIsPlayingAudio(false);
    });
  }, [currentWord]);

  // Auto-play audio when moving to next card
  useEffect(() => {
    if (autoPlayAudio && currentWord && !isFlipped) {
      const timer = setTimeout(() => {
        speakCurrentWord();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, autoPlayAudio, currentWord, speakCurrentWord]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < activeWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  }, [currentIndex, activeWords.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(activeWords.length - 1);
    }
  }, [currentIndex, activeWords.length]);

  // Rating a word (e.g. "easy") can remove it from a filtered list (need_review/bookmarked)
  // right as we advance. Record the *word id* that should come next before the list shrinks,
  // so the following card isn't skipped by a stale index -> see effect below.
  const handleRating = useCallback((rating: ReviewRating) => {
    if (!currentWord) return;
    pendingNextWordIdRef.current =
      activeWords.length > 1 ? activeWords[(currentIndex + 1) % activeWords.length].id : null;
    onReviewWord(currentWord.id, rating);
    setIsFlipped(false);
  }, [currentWord, activeWords, currentIndex, onReviewWord]);

  // Resolve the pending "next word" by id once the (possibly shrunk) filtered list updates.
  useEffect(() => {
    if (pendingNextWordIdRef.current === null) return;
    const targetId = pendingNextWordIdRef.current;
    pendingNextWordIdRef.current = null;
    const idx = activeWords.findIndex((w) => w.id === targetId);
    setCurrentIndex(idx >= 0 ? idx : 0);
  }, [activeWords]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleRating('hard');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRating('medium');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRating('easy');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.key === 'ArrowLeft') handleNext();
        else handlePrev();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        speakCurrentWord();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRating, handleNext, handlePrev, speakCurrentWord]);

  // Shuffle active words
  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * activeWords.length));
  };

  if (!currentWord || activeWords.length === 0) {
    return (
      <div
        className="rounded-3xl p-10 text-center border max-w-xl mx-auto space-y-4"
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        <BookOpen className="w-12 h-12 mx-auto text-amber-500 opacity-80" />
        <h2 className="text-xl font-bold">کلمه‌ای در این فیلتر یافت نشد!</h2>
        <p className="text-sm" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          {filterMode === 'bookmarked'
            ? 'شما هنوز کلمه‌ای را ستاره‌دار نکرده‌اید.'
            : 'همه لغات این بخش در جعبه‌های بالا قرار دارند و تسلط یافته‌اید!'}
        </p>
        <button
          onClick={() => setFilterMode('all')}
          className="px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs"
          style={{
            backgroundColor: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
          }}
        >
          نمایش تمام لغات سرفصل
        </button>
      </div>
    );
  }

  const boxNumber = wordProg?.box || 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
          <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            <span>مرور هوشمند و فلش‌کارت</span>
          </h2>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-full border" style={{ backgroundColor: 'var(--md-sys-color-surface-container)', borderColor: 'var(--md-sys-color-outline-variant)' }}>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'all' ? 'font-bold shadow-xs' : ''
            }`}
            style={{
              backgroundColor: filterMode === 'all' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: filterMode === 'all' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            همه ({words.length})
          </button>
          <button
            onClick={() => setFilterMode('need_review')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'need_review' ? 'font-bold shadow-xs' : ''
            }`}
            style={{
              backgroundColor: filterMode === 'need_review' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: filterMode === 'need_review' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            نیاز به مرور
          </button>
          <button
            onClick={() => setFilterMode('bookmarked')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterMode === 'bookmarked' ? 'font-bold shadow-xs' : ''
            }`}
            style={{
              backgroundColor: filterMode === 'bookmarked' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: filterMode === 'bookmarked' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            ستاره‌دارها
          </button>
        </div>
      </div>

      {/* Progress & Controls Bar */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-2xl border text-xs"
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-sm">
            {currentIndex + 1} <span className="opacity-50 font-normal">از</span> {activeWords.length}
          </span>
          <div className="w-24 sm:w-36 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / activeWords.length) * 100}%`,
                backgroundColor: 'var(--md-sys-color-primary)',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className="flex items-center gap-1.5 text-xs cursor-pointer opacity-80 hover:opacity-100"
            title="پخش خودکار تلفظ با ورود به کارت"
          >
            {autoPlayAudio ? <Volume1 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            <span className="hidden sm:inline">تلفظ خودکار</span>
          </button>

          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            title="بر زدن و نمایش تصادفی"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full min-h-[340px] sm:min-h-[400px]">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full min-h-[340px] sm:min-h-[400px] transition-transform duration-500 transform-style-3d cursor-pointer select-none rounded-3xl shadow-md border ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            borderColor: 'var(--md-sys-color-outline-variant)',
            backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
          }}
        >
          {/* Card Front (English Word) */}
          <div
            className={`absolute inset-0 p-6 sm:p-10 flex flex-col justify-between backface-hidden rounded-3xl ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Front Top Bar */}
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-high)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                }}
              >
                {category.title}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(currentWord.id);
                }}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-transform active:scale-90 cursor-pointer"
                title={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان کردن این لغت'}
              >
                <Star
                  className={`w-5 h-5 ${
                    isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'
                  }`}
                />
              </button>
            </div>

            {/* Center Content: Big English Word & Audio */}
            <div className="text-center my-auto space-y-4">
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-ltr dir-ltr font-sans">
                {currentWord.word}
              </h3>

              {/* Pronunciation Audio Button */}
              <div className="flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakCurrentWord();
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isPlayingAudio ? 'ring-4 ring-teal-400/30 scale-105' : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                  }}
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  <span>تلفظ نیتیو (کلید S)</span>
                </button>
              </div>
            </div>

            {/* Front Footer Hint */}
            <div className="flex items-center justify-between text-xs opacity-60 border-t pt-4" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
              <span>جعبه لایتنر: مرحله {boxNumber} از ۵</span>
              <span className="flex items-center gap-1 font-medium">
                <RotateCw className="w-3.5 h-3.5" />
                <span>برای معنی ضربه بزنید یا کلید Space</span>
              </span>
            </div>
          </div>

          {/* Card Back (Persian Meanings) */}
          <div
            className={`absolute inset-0 p-6 sm:p-10 flex flex-col justify-between backface-hidden rotate-y-180 rounded-3xl ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
            }}
          >
            {/* Back Top Bar */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
              <div className="flex items-center gap-2">
                <span className="text-base font-black dir-ltr text-ltr">{currentWord.word}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakCurrentWord();
                  }}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" style={{ color: 'var(--md-sys-color-primary)' }} />
                </button>
              </div>

              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--md-sys-color-secondary-container)',
                  color: 'var(--md-sys-color-on-secondary-container)',
                }}
              >
                جعبه {boxNumber}
              </span>
            </div>

            {/* Back Meanings List */}
            <div className="my-auto space-y-3 max-h-[220px] overflow-y-auto px-2">
              <span className="text-xs font-bold opacity-60 block">معانی و تعاریف فارسی:</span>
              <ul className="space-y-2">
                {currentWord.meanings.map((meaning, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-base sm:text-lg font-bold leading-relaxed"
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0"
                      style={{ backgroundColor: 'var(--md-sys-color-primary)' }}
                    />
                    <span>{meaning}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Back Footer */}
            <div className="text-center text-xs opacity-70 border-t pt-3" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
              سطح تسلط خود را در پایین انتخاب کنید
            </div>
          </div>
        </div>
      </div>

      {/* Leitner Evaluation Actions (M3 Buttons Bar) */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Hard / Repeat */}
          <button
            onClick={() => handleRating('hard')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--md-sys-color-error-container)',
              color: 'var(--md-sys-color-on-error-container)',
              borderColor: 'var(--md-sys-color-error)',
            }}
          >
            <span>🔴 بلد نبودم</span>
            <span className="text-[10px] opacity-75 font-normal">(کلید ۱)</span>
          </button>

          {/* Medium */}
          <button
            onClick={() => handleRating('medium')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--md-sys-color-secondary-container)',
              color: 'var(--md-sys-color-on-secondary-container)',
              borderColor: 'var(--md-sys-color-outline)',
            }}
          >
            <span>🟡 شک داشتم</span>
            <span className="text-[10px] opacity-75 font-normal">(کلید ۲)</span>
          </button>

          {/* Easy / Mastered */}
          <button
            onClick={() => handleRating('easy')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--md-sys-color-success-container)',
              color: 'var(--md-sys-color-on-success-container)',
              borderColor: 'var(--md-sys-color-success)',
            }}
          >
            <span>🟢 کاملاً بلدم</span>
            <span className="text-[10px] opacity-75 font-normal">(کلید ۳)</span>
          </button>
        </div>

        {/* Previous / Next Card Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>کارت قبلی</span>
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-1.5 rounded-full text-xs font-bold border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
          >
            چرخش کارت (Space)
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            <span>کارت بعدی</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
