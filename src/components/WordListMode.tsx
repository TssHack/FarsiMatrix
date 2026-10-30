'use client';

import React, { useState, useMemo } from 'react';
import { Word, Category, UserProgress } from '@/types';
import { playPronunciation } from '@/lib/speech';
import { 
  Search, 
  Volume2, 
  Star, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface WordListModeProps {
  category: Category;
  words: Word[];
  progress: UserProgress;
  onToggleBookmark: (wordId: string) => void;
  onChangeCategory: () => void;
}

export function WordListMode({
  category,
  words,
  progress,
  onToggleBookmark,
  onChangeCategory,
}: WordListModeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'bookmarked' | 'mastered' | 'learning'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // Filtered words
  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const p = progress.learnedWords[w.id];
      const isBookmarked = progress.bookmarkedWords.includes(w.id);

      let matchesStatus = true;
      if (statusFilter === 'bookmarked') matchesStatus = isBookmarked;
      else if (statusFilter === 'mastered') matchesStatus = !!p && p.box >= 4;
      else if (statusFilter === 'learning') matchesStatus = !!p && p.box < 4;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        w.word.toLowerCase().includes(q) ||
        w.meanings.some((m) => m.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [words, searchQuery, statusFilter, progress.learnedWords, progress.bookmarkedWords]);

  // Pagination
  const totalPages = Math.ceil(filteredWords.length / pageSize) || 1;
  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWords.slice(start, start + pageSize);
  }, [filteredWords, currentPage]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
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
          <h2 className="text-2xl font-black">فهرست و واژه‌نامه تخصصی</h2>
          <p className="text-xs" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            مجموعاً {words.length.toLocaleString('fa-IR')} لغت و اصطلاح تخصصی با تلفظ دقیق
          </p>
        </div>

        {/* Search Input (M3 Outlined Field) */}
        <div
          className="relative flex items-center rounded-full px-4 py-2 border shadow-xs max-w-xs w-full"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          <Search className="w-4 h-4 ml-2 opacity-60 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="جستجوی لغت یا معنی..."
            className="w-full bg-transparent outline-none text-xs font-medium"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `همه لغات (${words.length})` },
          { id: 'bookmarked', label: `ستاره‌دارها (${progress.bookmarkedWords.filter((id) => id.startsWith(`${category.id}_`)).length})` },
          { id: 'learning', label: 'در حال یادگیری' },
          { id: 'mastered', label: 'مسلط شده' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setStatusFilter(f.id as any);
              setCurrentPage(1);
            }}
            className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
            style={{
              backgroundColor:
                statusFilter === f.id
                  ? 'var(--md-sys-color-primary)'
                  : 'var(--md-sys-color-surface-container)',
              color:
                statusFilter === f.id
                  ? 'var(--md-sys-color-on-primary)'
                  : 'var(--md-sys-color-on-surface-variant)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Words List */}
      <div className="space-y-3">
        {paginatedWords.length === 0 ? (
          <div
            className="rounded-3xl p-12 text-center border"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
          >
            <p className="text-sm font-bold">هیچ لغتی با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          paginatedWords.map((item) => {
            const p = progress.learnedWords[item.id];
            const isBookmarked = progress.bookmarkedWords.includes(item.id);

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-xs"
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
              >
                {/* Left: Word & Meanings */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-wide dir-ltr text-ltr">
                      {item.word}
                    </span>
                    <button
                      onClick={() => playPronunciation(item.word)}
                      className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-teal-600 dark:text-teal-400"
                      title="پخش تلفظ صوتی"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {p && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            p.box >= 4
                              ? 'var(--md-sys-color-success-container)'
                              : 'var(--md-sys-color-secondary-container)',
                          color:
                            p.box >= 4
                              ? 'var(--md-sys-color-on-success-container)'
                              : 'var(--md-sys-color-on-secondary-container)',
                        }}
                      >
                        جعبه {p.box}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 leading-relaxed">
                    {item.meanings.join('، ')}
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-transform active:scale-90"
                    title={isBookmarked ? 'حذف نشان' : 'نشان کردن'}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold border disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
          >
            <ChevronRight className="w-4 h-4" />
            <span>صفحه قبل</span>
          </button>

          <span className="text-xs font-semibold">
            صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold border disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
          >
            <span>صفحه بعد</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
