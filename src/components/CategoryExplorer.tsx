'use client';

import React, { useMemo, useState } from 'react';
import { ActiveTab, Category, UserProgress } from '@/types';
import { Icon } from './m3/Icon';
import { Button, IconButton } from './m3/Button';
import { FilterChip, Tag } from './m3/Chip';
import { Shape, SHAPE_SEQUENCE } from './m3/Shape';
import { LinearProgress, CircularProgress } from './m3/Progress';
import { categoryIcon } from '@/lib/icons';
import { fa, faPercent } from '@/lib/format';

interface CategoryExplorerProps {
  categories: Category[];
  onSelectCategory: (cat: Category, mode: ActiveTab) => void;
  selectedCategory: Category | null;
  progress: UserProgress;
}

const CLUSTERS = [
  { id: 'all', label: 'همه', icon: 'apps' },
  { id: 'language', label: 'زبان و مکالمه', icon: 'translate' },
  { id: 'tech', label: 'فناوری', icon: 'memory' },
  { id: 'business', label: 'کسب‌وکار', icon: 'business_center' },
  { id: 'science', label: 'علوم و پزشکی', icon: 'science' },
  { id: 'engineering', label: 'مهندسی', icon: 'engineering' },
  { id: 'arts', label: 'سینما و هنر', icon: 'movie' },
];

const TONES = [
  'text-primary-container [--on:var(--md-sys-color-on-primary-container)]',
  'text-secondary-container [--on:var(--md-sys-color-on-secondary-container)]',
  'text-tertiary-container [--on:var(--md-sys-color-on-tertiary-container)]',
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'شب بخیر';
  if (h < 12) return 'صبح بخیر';
  if (h < 17) return 'روز بخیر';
  return 'عصر بخیر';
}

export function CategoryExplorer({ categories, onSelectCategory, selectedCategory, progress }: CategoryExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');

  // Per-category review stats in a single pass over progress
  const statsByCategory = useMemo(() => {
    const map: Record<string, { reviewed: number; mastered: number }> = {};
    for (const [wordId, w] of Object.entries(progress.learnedWords)) {
      const catId = wordId.slice(0, wordId.lastIndexOf('_'));
      const entry = (map[catId] ??= { reviewed: 0, mastered: 0 });
      entry.reviewed++;
      if (w.box >= 4) entry.mastered++;
    }
    return map;
  }, [progress.learnedWords]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((cat) => {
      const matchesCluster = selectedCluster === 'all' || cat.cluster === selectedCluster;
      const matchesSearch =
        !q ||
        cat.title.toLowerCase().includes(q) ||
        cat.englishTitle.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q);
      return matchesCluster && matchesSearch;
    });
  }, [categories, selectedCluster, searchQuery]);

  const totalWords = useMemo(() => categories.reduce((sum, c) => sum + c.wordCount, 0), [categories]);
  const totalReviewed = Object.keys(progress.learnedWords).length;
  const current = selectedCategory;
  const currentStats = current ? statsByCategory[current.id] ?? { reviewed: 0, mastered: 0 } : null;
  const currentRatio = current && currentStats ? Math.min(1, currentStats.reviewed / Math.max(1, current.wordCount)) : 0;

  return (
    <div className="space-y-8">
      {/* Greeting + search */}
      <section className="space-y-5 pt-2 animate-rise-in">
        <div>
          <p className="text-title-m text-primary">{greeting()}</p>
          <h2 className="mt-1 text-headline-m font-bold text-on-surface sm:text-display-s">امروز چه واژه‌هایی یاد بگیریم؟</h2>
          <p className="mt-2 text-body-l text-on-surface-variant">
            {fa(categories.length)} سرفصل تخصصی و {fa(totalWords)} واژه، با جعبه لایتنر و تلفظ صوتی — کاملاً آفلاین.
          </p>
        </div>

        <label className="flex h-14 max-w-2xl items-center gap-3 rounded-full bg-surface-container-high ps-4 pe-1 text-on-surface transition-shadow focus-within:shadow-elevation-2">
          <Icon name="search" className="text-on-surface-variant" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی سرفصل… مثلاً «کامپیوتر» یا «Biology»"
            aria-label="جستجوی سرفصل"
            className="h-full min-w-0 flex-1 bg-transparent text-body-l outline-none placeholder:text-on-surface-variant [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && <IconButton icon="close" label="پاک کردن جستجو" onClick={() => setSearchQuery('')} />}
        </label>
      </section>

      {/* Continue learning hero (filled card, primary container) */}
      {current && currentStats && !searchQuery && (
        <section
          aria-label="ادامه یادگیری"
          className="relative overflow-hidden rounded-shape-xl bg-primary-container p-6 text-on-primary-container sm:p-8 animate-rise-in"
        >
          <Shape
            kind="cookie12"
            size={260}
            className="pointer-events-none absolute -end-16 -top-20 text-primary opacity-[0.12]"
            spin
          />
          <Shape kind="clover4" size={140} className="pointer-events-none absolute -bottom-12 end-40 text-primary opacity-[0.08]" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <CircularProgress value={currentRatio} size={96} thickness={8} label="پیشرفت این سرفصل" className="shrink-0">
              <span className="grid place-items-center">
                <Icon name={categoryIcon(current.icon)} size={36} />
              </span>
            </CircularProgress>

            <div className="min-w-0 flex-1">
              <p className="text-label-l opacity-80">ادامه یادگیری</p>
              <h3 className="mt-1 text-headline-s font-bold">{current.title}</h3>
              <p className="mt-0.5 text-body-m opacity-80">
                <span className="latin">{current.englishTitle}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-body-m">
                <span>{faPercent(currentRatio)} مرور شده</span>
                <span aria-hidden="true">•</span>
                <span>{fa(currentStats.mastered)} واژه مسلط</span>
                <span aria-hidden="true">•</span>
                <span>{fa(current.wordCount)} واژه</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
              <Button size="md" icon="play_arrow" iconFilled onClick={() => onSelectCategory(current, 'flashcard')}>
                ادامه مرور
              </Button>
              <Button
                size="md"
                variant="outlined"
                icon="quiz"
                className="!border-on-primary-container/30 !text-on-primary-container"
                onClick={() => onSelectCategory(current, 'quiz')}
              >
                آزمون سریع
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Overall progress strip */}
      {totalReviewed > 0 && !searchQuery && (
        <div className="flex items-center gap-3 rounded-shape-lg bg-surface-container-low px-4 py-3 text-body-m text-on-surface-variant">
          <Icon name="auto_stories" className="text-primary" />
          <span>
            تا امروز <strong className="text-on-surface">{fa(totalReviewed)}</strong> واژه را مرور کرده‌اید.
          </span>
        </div>
      )}

      {/* Cluster filter chips */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-title-l text-on-surface">سرفصل‌ها</h2>
          <span className="text-label-l text-on-surface-variant">{fa(filteredCategories.length)} مورد</span>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
          {CLUSTERS.map((cluster) => (
            <FilterChip
              key={cluster.id}
              label={cluster.label}
              icon={cluster.icon}
              selected={selectedCluster === cluster.id}
              onClick={() => setSelectedCluster(cluster.id)}
            />
          ))}
        </div>

        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-shape-xl bg-surface-container-low px-6 py-16 text-center">
            <Shape kind="cookie9" size={88} className="text-secondary-container">
              <Icon name="search" size={36} className="text-on-secondary-container" />
            </Shape>
            <div>
              <p className="text-title-m text-on-surface">سرفصلی پیدا نشد</p>
              <p className="mt-1 text-body-m text-on-surface-variant">عبارت دیگری را جستجو کنید یا فیلتر را تغییر دهید.</p>
            </div>
            <Button
              variant="tonal"
              icon="restart_alt"
              onClick={() => {
                setSearchQuery('');
                setSelectedCluster('all');
              }}
            >
              نمایش همه
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((cat, idx) => {
              const stats = statsByCategory[cat.id] ?? { reviewed: 0, mastered: 0 };
              const ratio = Math.min(1, stats.reviewed / Math.max(1, cat.wordCount));
              const isCurrent = current?.id === cat.id;
              const tone = TONES[idx % TONES.length];
              return (
                <article
                  key={cat.id}
                  className={`group flex flex-col rounded-shape-lg-inc bg-surface-container-low p-5 transition-[background-color,box-shadow] duration-300 hover:bg-surface-container hover:shadow-elevation-1 ${
                    isCurrent ? 'outline-2 outline-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Shape
                      kind={SHAPE_SEQUENCE[idx % SHAPE_SEQUENCE.length]}
                      size={56}
                      className={`${tone} transition-transform duration-500 ease-spring group-hover:rotate-12 group-hover:scale-105`}
                    >
                      <Icon name={categoryIcon(cat.icon)} size={28} style={{ color: 'var(--on)' }} />
                    </Shape>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-title-m text-on-surface">{cat.title}</h3>
                      <p className="truncate text-body-s text-on-surface-variant">
                        <span className="latin">{cat.englishTitle}</span>
                      </p>
                    </div>
                    {isCurrent && <Tag tone="primary">فعلی</Tag>}
                  </div>

                  <p className="mt-3 line-clamp-2 text-body-m text-on-surface-variant">{cat.description}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Tag icon="signal_cellular_alt">{cat.level}</Tag>
                    <Tag icon="dictionary">{fa(cat.wordCount)} واژه</Tag>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="mb-2 flex justify-between text-label-m text-on-surface-variant">
                      <span>پیشرفت مرور</span>
                      <span className="text-on-surface">{faPercent(ratio)}</span>
                    </div>
                    <LinearProgress value={ratio} label={`پیشرفت ${cat.title}`} />

                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="tonal" icon="style" className="flex-1" onClick={() => onSelectCategory(cat, 'flashcard')}>
                        فلش‌کارت
                      </Button>
                      <IconButton icon="quiz" variant="outlined" label={`آزمون ${cat.title}`} onClick={() => onSelectCategory(cat, 'quiz')} />
                      <IconButton
                        icon="menu_book"
                        variant="outlined"
                        label={`واژه‌نامه ${cat.title}`}
                        onClick={() => onSelectCategory(cat, 'wordlist')}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
