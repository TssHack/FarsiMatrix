'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Category, Word, ActiveTab, UserProgress, ReviewRating } from '@/types';
import { 
  loadUserProgress, 
  saveUserProgress, 
  recordWordReview, 
  toggleWordBookmark, 
  recordQuizCompletion, 
  DEFAULT_PROGRESS 
} from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { CategoryExplorer } from '@/components/CategoryExplorer';
import { FlashcardMode } from '@/components/FlashcardMode';
import { QuizMode } from '@/components/QuizMode';
import { WordListMode } from '@/components/WordListMode';
import { StatsView } from '@/components/StatsView';
import { AboutModal } from '@/components/AboutModal';
import { Loader2, Globe, Heart } from 'lucide-react';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('categories');
  const [wordsCache, setWordsCache] = useState<Record<string, Word[]>>({});
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [isDark, setIsDark] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize theme, progress, and PWA install prompt
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('farsimatrix_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // PWA install event listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Load progress
    const loaded = loadUserProgress();
    setProgress(loaded);

    // Fetch categories manifest
    fetch('/data/categories.json')
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) {
          // Pre-select 'computer' or first category
          const defaultCat = data.find((c) => c.id === 'computer') || data[0];
          setSelectedCategory(defaultCat);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => setIsLoadingInitial(false));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Sync theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('farsimatrix_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('farsimatrix_theme', 'light');
    }
  }, [isDark]);

  // PWA install trigger
  const handleInstallPWA = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      }
      setDeferredPrompt(null);
    });
  };

  // Load words for a category (with in-memory cache)
  const loadWordsForCategory = useCallback(
    async (categoryId: string): Promise<Word[]> => {
      if (wordsCache[categoryId]) {
        return wordsCache[categoryId];
      }

      setIsLoadingWords(true);
      try {
        const res = await fetch(`/data/groups/${categoryId}.json`);
        if (!res.ok) throw new Error('Failed to load category words');
        const data: Word[] = await res.json();
        setWordsCache((prev) => ({ ...prev, [categoryId]: data }));
        return data;
      } catch (err) {
        console.error('Error loading category words:', err);
        return [];
      } finally {
        setIsLoadingWords(false);
      }
    },
    [wordsCache]
  );

  // When selectedCategory changes, ensure words are loaded
  useEffect(() => {
    if (selectedCategory && !wordsCache[selectedCategory.id]) {
      loadWordsForCategory(selectedCategory.id);
    }
  }, [selectedCategory, loadWordsForCategory, wordsCache]);

  // Select category handler
  const handleSelectCategory = async (cat: Category, mode: ActiveTab = 'flashcard') => {
    setSelectedCategory(cat);
    await loadWordsForCategory(cat.id);
    setActiveTab(mode);
  };

  // Review word handler
  const handleReviewWord = (wordId: string, rating: ReviewRating) => {
    const updated = recordWordReview(wordId, rating);
    setProgress(updated);
  };

  // Bookmark handler
  const handleToggleBookmark = (wordId: string) => {
    const { progress: updated } = toggleWordBookmark(wordId);
    setProgress(updated);
  };

  // Quiz completion handler
  const handleQuizCompletion = (total: number, correct: number) => {
    const updated = recordQuizCompletion(total, correct);
    setProgress(updated);
  };

  // Reset progress handler
  const handleResetProgress = () => {
    saveUserProgress(DEFAULT_PROGRESS);
    setProgress(DEFAULT_PROGRESS);
  };

  // Import progress handler
  const handleImportProgress = (imported: UserProgress) => {
    saveUserProgress(imported);
    setProgress(imported);
  };

  const currentWords = selectedCategory ? wordsCache[selectedCategory.id] || [] : [];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* Top Navbar & Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progress={progress}
        isDark={isDark}
        setIsDark={setIsDark}
        selectedCategoryTitle={selectedCategory?.title}
        onOpenAbout={() => setIsAboutOpen(true)}
        deferredPrompt={deferredPrompt}
        onInstallPWA={handleInstallPWA}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full">
        {isLoadingInitial ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--md-sys-color-primary)]" />
            <p className="text-sm font-bold opacity-75">در حال بارگذاری پایگاه واژگان فارسی ماتریکس...</p>
          </div>
        ) : (
          <>
            {activeTab === 'categories' && (
              <CategoryExplorer
                categories={categories}
                onSelectCategory={(cat, mode) => handleSelectCategory(cat, (mode as ActiveTab) || 'flashcard')}
                selectedCategory={selectedCategory}
                progress={progress}
                onOpenAbout={() => setIsAboutOpen(true)}
              />
            )}

            {activeTab === 'flashcard' && selectedCategory && (
              isLoadingWords && currentWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[var(--md-sys-color-primary)]" />
                  <p className="text-sm font-bold opacity-75">در حال آماده‌سازی کارت‌های {selectedCategory.title}...</p>
                </div>
              ) : (
                <FlashcardMode
                  category={selectedCategory}
                  words={currentWords}
                  progress={progress}
                  onReviewWord={handleReviewWord}
                  onToggleBookmark={handleToggleBookmark}
                  onChangeCategory={() => setActiveTab('categories')}
                />
              )
            )}

            {activeTab === 'quiz' && selectedCategory && (
              isLoadingWords && currentWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[var(--md-sys-color-primary)]" />
                  <p className="text-sm font-bold opacity-75">در حال ساخت کوئیز تعاملی...</p>
                </div>
              ) : (
                <QuizMode
                  category={selectedCategory}
                  words={currentWords}
                  progress={progress}
                  onRecordQuizCompletion={handleQuizCompletion}
                  onStartFlashcard={() => setActiveTab('flashcard')}
                  onChangeCategory={() => setActiveTab('categories')}
                />
              )
            )}

            {activeTab === 'wordlist' && selectedCategory && (
              isLoadingWords && currentWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[var(--md-sys-color-primary)]" />
                  <p className="text-sm font-bold opacity-75">در حال لود واژگان {selectedCategory.title}...</p>
                </div>
              ) : (
                <WordListMode
                  category={selectedCategory}
                  words={currentWords}
                  progress={progress}
                  onToggleBookmark={handleToggleBookmark}
                  onChangeCategory={() => setActiveTab('categories')}
                />
              )
            )}

            {activeTab === 'stats' && (
              <StatsView
                progress={progress}
                categories={categories}
                onResetProgress={handleResetProgress}
                onImportProgress={handleImportProgress}
                onStartStudy={() => setActiveTab('categories')}
              />
            )}
          </>
        )}
      </main>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallPWA={handleInstallPWA}
      />

      {/* Footer */}
      <footer
        className="border-t py-6 mt-auto text-xs"
        style={{
          borderColor: 'var(--md-sys-color-outline-variant)',
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div>
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              فارسی ماتریکس (FarsiMatrix) — طراحی و توسعه توسط{' '}
              <a
                href="https://ehsanfazli.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-[var(--md-sys-color-primary)] transition-colors"
              >
                احسان فضلی (Ehsan Fazli)
              </a>
            </p>
            <p className="text-[11px] opacity-60 mt-0.5">
              پلتفرم یادگیری لغات با جعبه لایتنر و معماری کاملاً محلی (Zero DB Cost)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:underline font-medium cursor-pointer"
            >
              درباره سازنده و پروژه
            </button>
            <span>•</span>
            <a
              href="https://github.com/TssHack/FarsiMatrix"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-medium"
            >
              گیت‌هاب (GitHub)
            </a>
            <span>•</span>
            <a
              href="https://ehsanfazli.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-bold text-teal-600 dark:text-teal-400"
            >
              ehsanfazli.ir
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
