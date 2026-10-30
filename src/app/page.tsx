'use client';

import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Category, Word, ActiveTab, UserProgress, ReviewRating } from '@/types';
import {
  loadUserProgress,
  saveUserProgress,
  recordWordReview,
  toggleWordBookmark,
  recordQuizCompletion,
  DEFAULT_PROGRESS,
} from '@/lib/storage';
import { applyTheme, loadThemeSettings, ThemeSettings } from '@/lib/theme';
import { NavigationBar, NavigationRail, TopAppBar } from '@/components/AppShell';
import { CategoryExplorer } from '@/components/CategoryExplorer';
import { FlashcardMode } from '@/components/FlashcardMode';
import { QuizMode } from '@/components/QuizMode';
import { WordListMode } from '@/components/WordListMode';
import { StatsView } from '@/components/StatsView';
import { AboutModal } from '@/components/AboutModal';
import { ThemeDialog } from '@/components/ThemeDialog';
import { LoadingIndicator } from '@/components/m3/Progress';
import { Button } from '@/components/m3/Button';

const TABS: ActiveTab[] = ['categories', 'flashcard', 'quiz', 'wordlist', 'stats'];
const LAST_CATEGORY_KEY = 'farsimatrix_last_category';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function subscribeHash(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function parseHash(hash: string): { tab: ActiveTab; categoryId?: string } {
  const [tab, categoryId] = hash.replace(/^#\/?/, '').split('/');
  return TABS.includes(tab as ActiveTab) ? { tab: tab as ActiveTab, categoryId: categoryId || undefined } : { tab: 'categories' };
}

function readLastCategory(): string {
  if (typeof window === 'undefined') return 'computer';
  try {
    return localStorage.getItem(LAST_CATEGORY_KEY) || 'computer';
  } catch {
    return 'computer';
  }
}

function PageLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-28">
      <LoadingIndicator size={56} label={label} />
      <p className="text-body-m text-on-surface-variant">{label}</p>
    </div>
  );
}

export default function Home() {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => '');
  const route = useMemo(() => parseHash(hash), [hash]);
  const activeTab = route.tab;

  const [categories, setCategories] = useState<Category[]>([]);
  const [lastCategoryId, setLastCategoryId] = useState<string>(readLastCategory);
  const [wordsCache, setWordsCache] = useState<Record<string, Word[]>>({});
  const [failedCategories, setFailedCategories] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(loadThemeSettings);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const selectedCategoryId = route.categoryId ?? lastCategoryId;
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) ?? categories.find((c) => c.id === 'computer') ?? categories[0] ?? null,
    [categories, selectedCategoryId]
  );

  // Initial data: categories manifest + local progress
  useEffect(() => {
    fetch('/data/categories.json')
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err))
      .finally(() => {
        setProgress(loadUserProgress());
        setIsLoadingInitial(false);
      });

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  // Keep "system" theme mode in sync with the OS setting
  useEffect(() => {
    if (themeSettings.mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(themeSettings);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [themeSettings]);

  // Lazy-load the selected category's words
  const needsWords = !!selectedCategory && activeTab !== 'categories' && activeTab !== 'stats';
  const selectedId = selectedCategory?.id;
  const hasWords = selectedId ? !!wordsCache[selectedId] : false;
  const hasFailed = selectedId ? !!failedCategories[selectedId] : false;
  useEffect(() => {
    if (!needsWords || !selectedId || hasWords || hasFailed) return;
    let cancelled = false;
    fetch(`/data/groups/${selectedId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Word[]) => {
        if (!cancelled) setWordsCache((prev) => ({ ...prev, [selectedId]: data }));
      })
      .catch((err) => {
        console.error('Error loading category words:', err);
        if (!cancelled) setFailedCategories((prev) => ({ ...prev, [selectedId]: true }));
      });
    return () => {
      cancelled = true;
    };
  }, [needsWords, selectedId, hasWords, hasFailed]);

  const navigate = useCallback(
    (tab: ActiveTab, categoryId?: string) => {
      const id = categoryId ?? selectedCategory?.id;
      if (id) {
        setLastCategoryId(id);
        try {
          localStorage.setItem(LAST_CATEGORY_KEY, id);
        } catch {
          // storage unavailable
        }
      }
      const withCategory = tab === 'flashcard' || tab === 'quiz' || tab === 'wordlist';
      const nextHash = `#/${tab}${withCategory && id ? `/${id}` : ''}`;
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      }
      window.scrollTo({ top: 0 });
    },
    [selectedCategory]
  );

  const handleThemeChange = (next: ThemeSettings) => {
    setThemeSettings(next);
    applyTheme(next);
  };

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const handleReviewWord = (wordId: string, rating: ReviewRating) => setProgress(recordWordReview(wordId, rating));
  const handleToggleBookmark = (wordId: string) => setProgress(toggleWordBookmark(wordId).progress);
  const handleQuizCompletion = (total: number, correct: number) => setProgress(recordQuizCompletion(total, correct));
  const handleResetProgress = () => {
    saveUserProgress(DEFAULT_PROGRESS);
    setProgress(DEFAULT_PROGRESS);
  };
  const handleImportProgress = (imported: UserProgress) => {
    saveUserProgress(imported);
    setProgress(imported);
  };

  const currentWords = selectedCategory ? wordsCache[selectedCategory.id] : undefined;

  const renderWordScreen = (render: (category: Category, words: Word[]) => React.ReactNode, loadingLabel: string) => {
    if (!selectedCategory) return null;
    if (hasFailed) {
      return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-title-m">بارگذاری واژگان این سرفصل ممکن نشد.</p>
          <Button
            variant="tonal"
            icon="refresh"
            onClick={() => setFailedCategories((prev) => ({ ...prev, [selectedCategory.id]: false }))}
          >
            تلاش دوباره
          </Button>
        </div>
      );
    }
    if (!currentWords) return <PageLoader label={loadingLabel} />;
    return render(selectedCategory, currentWords);
  };

  return (
    <div className="min-h-dvh">
      <NavigationRail
        activeTab={activeTab}
        onNavigate={(tab) => navigate(tab)}
        onOpenTheme={() => setIsThemeOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onContinue={() => navigate('flashcard')}
      />

      <div className="flex min-h-dvh flex-col sm:ps-24">
        <TopAppBar
          activeTab={activeTab}
          subtitle={selectedCategory?.title}
          streak={progress.dailyStreak.count}
          canInstall={!!installPrompt}
          onInstall={handleInstallPWA}
          onOpenTheme={() => setIsThemeOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenStats={() => navigate('stats')}
          onHome={() => navigate('categories')}
        />

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-8 pt-2 sm:px-6">
          {isLoadingInitial ? (
            <PageLoader label="در حال آماده‌سازی واژگان…" />
          ) : (
            <div key={`${activeTab}:${selectedCategory?.id ?? ''}`} className="animate-fade-through">
              {activeTab === 'categories' && (
                <CategoryExplorer
                  categories={categories}
                  selectedCategory={selectedCategory}
                  progress={progress}
                  onSelectCategory={(cat, mode) => navigate(mode, cat.id)}
                />
              )}

              {activeTab === 'flashcard' &&
                renderWordScreen(
                  (category, words) => (
                    <FlashcardMode
                      category={category}
                      words={words}
                      progress={progress}
                      onReviewWord={handleReviewWord}
                      onToggleBookmark={handleToggleBookmark}
                      onChangeCategory={() => navigate('categories')}
                    />
                  ),
                  'در حال آماده‌سازی کارت‌ها…'
                )}

              {activeTab === 'quiz' &&
                renderWordScreen(
                  (category, words) => (
                    <QuizMode
                      category={category}
                      words={words}
                      onRecordQuizCompletion={handleQuizCompletion}
                      onStartFlashcard={() => navigate('flashcard')}
                      onChangeCategory={() => navigate('categories')}
                    />
                  ),
                  'در حال ساخت آزمون…'
                )}

              {activeTab === 'wordlist' &&
                renderWordScreen(
                  (category, words) => (
                    <WordListMode
                      category={category}
                      words={words}
                      progress={progress}
                      onToggleBookmark={handleToggleBookmark}
                      onChangeCategory={() => navigate('categories')}
                    />
                  ),
                  'در حال بارگذاری واژه‌نامه…'
                )}

              {activeTab === 'stats' && (
                <StatsView
                  progress={progress}
                  categories={categories}
                  onResetProgress={handleResetProgress}
                  onImportProgress={handleImportProgress}
                  onStartStudy={() => navigate('flashcard')}
                />
              )}
            </div>
          )}
        </main>

        <footer className="px-4 pb-[calc(104px+env(safe-area-inset-bottom,0px))] pt-4 text-center text-body-s text-on-surface-variant sm:pb-6">
          فارسی ماتریکس — طراحی و توسعه توسط{' '}
          <a href="https://ehsanfazli.ir" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
            احسان فضلی
          </a>
          {' · '}
          <a
            href="https://github.com/TssHack/FarsiMatrix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            گیت‌هاب
          </a>
        </footer>
      </div>

      <NavigationBar activeTab={activeTab} onNavigate={(tab) => navigate(tab)} />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        canInstall={!!installPrompt}
        onInstallPWA={handleInstallPWA}
      />
      <ThemeDialog open={isThemeOpen} onClose={() => setIsThemeOpen(false)} settings={themeSettings} onChange={handleThemeChange} />
    </div>
  );
}
