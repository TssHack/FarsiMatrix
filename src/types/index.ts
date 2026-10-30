export interface Category {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  cluster: 'language' | 'tech' | 'business' | 'science' | 'engineering' | 'arts' | 'general';
  clusterTitle: string;
  icon: string;
  level: 'مقدماتی' | 'متوسط' | 'پیشرفته';
  wordCount: number;
}

export interface Word {
  id: string;
  word: string;
  meanings: string[];
  category: string;
  phonetic?: string;
}

export type ReviewRating = 'easy' | 'medium' | 'hard';

export interface WordProgress {
  box: number; // 1 to 5 (Leitner box stage)
  lastReviewed: number; // timestamp
  reviewCount: number;
  correctCount: number;
  lastRating: ReviewRating;
}

export interface UserProgress {
  learnedWords: Record<string, WordProgress>;
  bookmarkedWords: string[];
  dailyStreak: {
    count: number;
    lastActiveDate: string; // YYYY-MM-DD
  };
  quizStats: {
    totalQuizzes: number;
    totalQuestions: number;
    correctAnswers: number;
  };
}

export type ActiveTab = 'categories' | 'flashcard' | 'quiz' | 'wordlist' | 'stats';
