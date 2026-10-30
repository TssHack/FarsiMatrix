'use client';

import React, { useMemo, useState } from 'react';
import { Word, Category, UserProgress } from '@/types';
import { playPronunciation } from '@/lib/speech';
import { fa } from '@/lib/format';
import { Icon } from './m3/Icon';
import { IconButton } from './m3/Button';
import { FilterChip, Tag } from './m3/Chip';
import { Shape } from './m3/Shape';

interface WordListModeProps {
  category: Category;
  words: Word[];
  progress: UserProgress;
  onToggleBookmark: (wordId: string) => void;
  onChangeCategory: () => void;
}

type StatusFilter = 'all' | 'bookmarked' | 'learning' | 'mastered' | 'new';
const PAGE_SIZE = 30;

export function WordListMode({ category, words, progress, onToggleBookmark, onChangeCategory }: WordListModeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const bookmarkedSet = useMemo(() => new Set(progress.bookmarkedWords), [progress.bookmarkedWords]);

  const counts = useMemo(() => {
    const c = { all: words.length, bookmarked: 0, learning: 0, mastered: 0, new: 0 };
    for (const w of words) {
      const p = progress.learnedWords[w.id];
      if (bookmarkedSet.has(w.id)) c.bookmarked++;
      if (!p) c.new++;
      else if (p.box >= 4) c.mastered++;
      else c.learning++;
    }
    return c;
  }, [words, progress.learnedWords, bookmarkedSet]);

  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return words.filter((w) => {
      const p = progress.learnedWords[w.id];
      let matchesStatus = true;
      if (statusFilter === 'bookmarked') matchesStatus = bookmarkedSet.has(w.id);
      else if (statusFilter === 'mastered') matchesStatus = !!p && p.box >= 4;
      else if (statusFilter === 'learning') matchesStatus = !!p && p.box < 4;
      else if (statusFilter === 'new') matchesStatus = !p;
      const matchesSearch = !q || w.word.toLowerCase().includes(q) || w.meanings.some((m) => m.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [words, searchQuery, statusFilter, progress.learnedWords, bookmarkedSet]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pageWords = filteredWords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filters: { id: StatusFilter; label: string; icon?: string }[] = [
    { id: 'all', label: `همه · ${fa(counts.all)}` },
    { id: 'bookmarked', label: `نشان‌شده · ${fa(counts.bookmarked)}`, icon: 'star' },
    { id: 'new', label: `جدید · ${fa(counts.new)}`, icon: 'auto_awesome' },
    { id: 'learning', label: `در حال یادگیری · ${fa(counts.learning)}`, icon: 'school' },
    { id: 'mastered', label: `مسلط · ${fa(counts.mastered)}`, icon: 'workspace_premium' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-2">
        <IconButton icon="arrow_forward" label="بازگشت به سرفصل‌ها" onClick={onChangeCategory} />
        <div className="min-w-0">
          <h2 className="truncate text-title-l text-on-surface">{category.title}</h2>
          <p className="text-body-s text-on-surface-variant">واژه‌نامه · {fa(words.length)} واژه</p>
        </div>
      </div>

      <label className="flex h-14 items-center gap-3 rounded-full bg-surface-container-high ps-4 pe-1 transition-shadow focus-within:shadow-elevation-2">
        <Icon name="search" className="text-on-surface-variant" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="جستجوی واژه یا معنی…"
          aria-label="جستجوی واژه یا معنی"
          className="h-full min-w-0 flex-1 bg-transparent text-body-l outline-none placeholder:text-on-surface-variant [&::-webkit-search-cancel-button]:hidden"
        />
        {searchQuery && (
          <IconButton
            icon="close"
            label="پاک کردن جستجو"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
          />
        )}
      </label>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
        {filters.map((f) => (
          <FilterChip
            key={f.id}
            label={f.label}
            icon={f.icon}
            selected={statusFilter === f.id}
            onClick={() => {
              setStatusFilter(f.id);
              setCurrentPage(1);
            }}
          />
        ))}
      </div>

      {pageWords.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-shape-xl bg-surface-container-low px-6 py-16 text-center">
          <Shape kind="cookie6" size={88} className="text-secondary-container">
            <Icon name="search" size={36} className="text-on-secondary-container" />
          </Shape>
          <p className="text-title-m text-on-surface">واژه‌ای با این مشخصات پیدا نشد</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-shape-xl bg-surface-container-low">
          {pageWords.map((item, idx) => {
            const p = progress.learnedWords[item.id];
            const isBookmarked = bookmarkedSet.has(item.id);
            return (
              <li
                key={item.id}
                className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-container sm:px-5 ${
                  idx > 0 ? 'border-t border-outline-variant/60' : ''
                }`}
              >
                <span
                  className={`latin grid h-10 w-10 shrink-0 place-items-center rounded-full text-title-m font-bold uppercase ${
                    p && p.box >= 4 ? 'bg-success-container text-on-success-container' : 'bg-primary-container text-on-primary-container'
                  }`}
                  aria-hidden="true"
                >
                  {item.word.replace(/^[^a-zA-Z0-9]+/, '').charAt(0) || '·'}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span dir="ltr" className="latin text-body-l font-semibold text-on-surface">
                      {item.word}
                    </span>
                    {p && <Tag tone={p.box >= 4 ? 'success' : 'secondary'}>جعبه {fa(p.box)}</Tag>}
                  </div>
                  <p className="text-body-m text-on-surface-variant">{item.meanings.join('، ')}</p>
                </div>

                <div className="flex shrink-0 items-center">
                  <IconButton icon="volume_up" label={`تلفظ ${item.word}`} onClick={() => playPronunciation(item.word)} />
                  <IconButton
                    icon="star"
                    label={isBookmarked ? 'حذف نشان' : 'نشان کردن'}
                    selected={isBookmarked}
                    className={isBookmarked ? '!text-flame' : ''}
                    onClick={() => onToggleBookmark(item.id)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="صفحه‌بندی" className="flex items-center justify-center gap-3">
          <IconButton icon="chevron_right" variant="outlined" label="صفحه قبل" disabled={page === 1} onClick={() => goToPage(page - 1)} />
          <span className="min-w-28 text-center text-label-l text-on-surface">
            صفحه {fa(page)} از {fa(totalPages)}
          </span>
          <IconButton
            icon="chevron_left"
            variant="outlined"
            label="صفحه بعد"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
          />
        </nav>
      )}
    </div>
  );
}
