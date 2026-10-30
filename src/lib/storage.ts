import { UserProgress, WordProgress, ReviewRating } from '@/types';

const STORAGE_KEY = 'farsimatrix_user_progress_v1';

export const DEFAULT_PROGRESS: UserProgress = {
  learnedWords: {},
  bookmarkedWords: [],
  dailyStreak: {
    count: 0,
    lastActiveDate: '',
  },
  quizStats: {
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
  },
};

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadUserProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      learnedWords: parsed.learnedWords || {},
      bookmarkedWords: parsed.bookmarkedWords || [],
      dailyStreak: parsed.dailyStreak || DEFAULT_PROGRESS.dailyStreak,
      quizStats: parsed.quizStats || DEFAULT_PROGRESS.quizStats,
    };
  } catch (err) {
    console.error('Failed to load user progress:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save user progress:', err);
  }
}

export function checkAndUpdateStreak(progress: UserProgress): UserProgress {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const current = progress.dailyStreak;

  if (current.lastActiveDate === today) {
    return progress; // Already updated today
  }

  let newCount = 1;
  if (current.lastActiveDate === yesterday) {
    newCount = current.count + 1;
  } else if (!current.lastActiveDate) {
    newCount = 1;
  } else {
    newCount = 1; // Streak broken
  }

  const updated: UserProgress = {
    ...progress,
    dailyStreak: {
      count: newCount,
      lastActiveDate: today,
    },
  };
  saveUserProgress(updated);
  return updated;
}

export function recordWordReview(
  wordId: string,
  rating: ReviewRating
): UserProgress {
  let progress = loadUserProgress();
  progress = checkAndUpdateStreak(progress);

  const existing = progress.learnedWords[wordId] || {
    box: 1,
    lastReviewed: 0,
    reviewCount: 0,
    correctCount: 0,
    lastRating: 'medium',
  };

  let newBox = existing.box;
  let correctIncrement = 0;

  if (rating === 'easy') {
    newBox = Math.min(existing.box + 1, 5);
    correctIncrement = 1;
  } else if (rating === 'medium') {
    // stays in current box
    correctIncrement = 1;
  } else if (rating === 'hard') {
    newBox = 1; // back to box 1 for spaced review
  }

  const updatedWord: WordProgress = {
    box: newBox,
    lastReviewed: Date.now(),
    reviewCount: existing.reviewCount + 1,
    correctCount: existing.correctCount + correctIncrement,
    lastRating: rating,
  };

  const updatedProgress: UserProgress = {
    ...progress,
    learnedWords: {
      ...progress.learnedWords,
      [wordId]: updatedWord,
    },
  };

  saveUserProgress(updatedProgress);
  return updatedProgress;
}

export function toggleWordBookmark(wordId: string): { isBookmarked: boolean; progress: UserProgress } {
  const progress = loadUserProgress();
  const index = progress.bookmarkedWords.indexOf(wordId);
  let updatedBookmarks: string[];
  let isBookmarked = false;

  if (index > -1) {
    updatedBookmarks = progress.bookmarkedWords.filter((id) => id !== wordId);
    isBookmarked = false;
  } else {
    updatedBookmarks = [...progress.bookmarkedWords, wordId];
    isBookmarked = true;
  }

  const updated: UserProgress = {
    ...progress,
    bookmarkedWords: updatedBookmarks,
  };
  saveUserProgress(updated);
  return { isBookmarked, progress: updated };
}

export function recordQuizCompletion(
  questionsCount: number,
  correctCount: number
): UserProgress {
  let progress = loadUserProgress();
  progress = checkAndUpdateStreak(progress);

  const updated: UserProgress = {
    ...progress,
    quizStats: {
      totalQuizzes: (progress.quizStats?.totalQuizzes || 0) + 1,
      totalQuestions: (progress.quizStats?.totalQuestions || 0) + questionsCount,
      correctAnswers: (progress.quizStats?.correctAnswers || 0) + correctCount,
    },
  };

  saveUserProgress(updated);
  return updated;
}
