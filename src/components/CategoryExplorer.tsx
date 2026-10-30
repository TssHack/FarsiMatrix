'use client';

import React, { useState, useMemo } from 'react';
import { Category, UserProgress } from '@/types';
import { DynamicIcon } from './DynamicIcon';
import { 
  Search, 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  HelpCircle, 
  ListFilter,
  CheckCircle2,
  TrendingUp,
  Zap,
  Globe,
  Award,
  BookMarked,
  Cpu,
  GraduationCap,
  Briefcase,
  Compass,
  Film
} from 'lucide-react';

interface CategoryExplorerProps {
  categories: Category[];
  onSelectCategory: (cat: Category, mode?: 'flashcard' | 'quiz' | 'wordlist') => void;
  selectedCategory: Category | null;
  progress: UserProgress;
  onOpenAbout: () => void;
}

export function CategoryExplorer({
  categories,
  onSelectCategory,
  selectedCategory,
  progress,
  onOpenAbout,
}: CategoryExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');

  const clusters = [
    { id: 'all', label: 'همه سرفصل‌ها', icon: BookMarked },
    { id: 'language', label: 'آموزش زبان و مکالمه', icon: GraduationCap },
    { id: 'tech', label: 'فناوری و کامپیوتر', icon: Cpu },
    { id: 'business', label: 'کسب‌وکار و مدیریت', icon: Briefcase },
    { id: 'science', label: 'علوم پایه و پزشکی', icon: Compass },
    { id: 'engineering', label: 'فنی و مهندسی', icon: Zap },
    { id: 'arts', label: 'سینما و هنر', icon: Film },
  ];

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesCluster = selectedCluster === 'all' || cat.cluster === selectedCluster;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        cat.title.toLowerCase().includes(query) ||
        cat.englishTitle.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query) ||
        cat.id.toLowerCase().includes(query);
      return matchesCluster && matchesSearch;
    });
  }, [categories, selectedCluster, searchQuery]);

  // Calculate stats for a category from progress
  const getCategoryStats = (categoryId: string, totalCount: number) => {
    let reviewed = 0;
    let mastered = 0;
    Object.entries(progress.learnedWords).forEach(([wordId, wProg]) => {
      if (wordId.startsWith(`${categoryId}_`)) {
        reviewed++;
        if (wProg.box >= 4) mastered++;
      }
    });
    const percentage = totalCount > 0 ? Math.min(Math.round((reviewed / totalCount) * 100), 100) : 0;
    return { reviewed, mastered, percentage };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner (Material Design 3 Expressive Showcase) */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border transition-all shadow-xs"
        style={{
          background: 'linear-gradient(135deg, var(--md-sys-color-surface-container-high) 0%, var(--md-sys-color-surface-container) 100%)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        <div className="relative z-10 max-w-3xl">
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black shadow-xs"
              style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>فارسی ماتریکس (Material Design 3)</span>
            </div>

            <button
              onClick={onOpenAbout}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border transition-colors"
              style={{
                borderColor: 'var(--md-sys-color-outline-variant)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              <span>توسعه‌دهنده: احسان فضلی</span>
              <span className="text-[10px] opacity-75 font-mono">(ehsanfazli.ir)</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 leading-snug">
            سامانه مدرن یادگیری و حفظ زمان‌دار واژگان تخصصی
          </h1>
          <p
            className="text-xs sm:text-base leading-relaxed mb-6 font-medium"
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          >
            سرفصل مد نظرت رو انتخاب کن و با تکیه بر <strong>جعبه لایتنر ۵ مرحله‌ای</strong>، تلفظ هوشمند صوتی و کوئیزهای تعاملی، واژگان را در حافظه بلندمدت تثبیت کن.
          </p>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            <div
              className="px-3.5 py-2 rounded-2xl border text-center"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
            >
              <span className="text-base sm:text-lg font-black block">۵۱</span>
              <span className="text-[10px] sm:text-xs opacity-75 font-semibold">سرفصل تخصصی</span>
            </div>

            <div
              className="px-3.5 py-2 rounded-2xl border text-center"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
            >
              <span className="text-base sm:text-lg font-black block">۲۵۰,۰۰۰+</span>
              <span className="text-[10px] sm:text-xs opacity-75 font-semibold">لغت و اصطلاح</span>
            </div>

            <div
              className="px-3.5 py-2 rounded-2xl border text-center"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
            >
              <span className="text-base sm:text-lg font-black block text-teal-600 dark:text-teal-400">PWA</span>
              <span className="text-[10px] sm:text-xs opacity-75 font-semibold">۱۰۰٪ آفلاین و محلی</span>
            </div>

            <div
              className="px-3.5 py-2 rounded-2xl border text-center"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
            >
              <span className="text-base sm:text-lg font-black block text-emerald-600 dark:text-emerald-400">۰ تومان</span>
              <span className="text-[10px] sm:text-xs opacity-75 font-semibold">هزینه سرور دیتابیس</span>
            </div>
          </div>

          {/* Quick Search Bar (M3 Search Bar Spec) */}
          <div
            className="relative flex items-center rounded-full px-4 py-2.5 sm:py-3.5 shadow-xs border max-w-xl transition-all focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
          >
            <Search
              className="w-5 h-5 ml-3 flex-shrink-0"
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بین ۵۱ سرفصل (مثلاً: کامپیوتر، اصطلاحات، الگوریتم...)"
              className="w-full bg-transparent outline-none text-xs sm:text-sm font-medium placeholder:text-[var(--md-sys-color-outline)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs px-2.5 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer font-bold"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                پاک کردن
              </button>
            )}
          </div>
        </div>

        {/* Decorative background shape */}
        <div
          className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ backgroundColor: 'var(--md-sys-color-primary)' }}
        />
      </div>

      {/* Cluster Filter Chips (M3 Filter Chips with Icons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {clusters.map((cluster) => {
          const isSelected = selectedCluster === cluster.id;
          const Icon = cluster.icon;
          return (
            <button
              key={cluster.id}
              onClick={() => setSelectedCluster(cluster.id)}
              className="whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center gap-2"
              style={{
                backgroundColor: isSelected
                  ? 'var(--md-sys-color-primary)'
                  : 'var(--md-sys-color-surface-container)',
                color: isSelected
                  ? 'var(--md-sys-color-on-primary)'
                  : 'var(--md-sys-color-on-surface-variant)',
                border: isSelected
                  ? '1px solid transparent'
                  : '1px solid var(--md-sys-color-outline-variant)',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cluster.label}</span>
            </button>
          );
        })}
      </div>

      {/* Categories Grid (M3 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>سرفصل‌های آموزشی</span>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
              }}
            >
              {filteredCategories.length} موضوع
            </span>
          </h2>
        </div>

        {filteredCategories.length === 0 ? (
          <div
            className="rounded-3xl p-12 text-center border"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
          >
            <p className="text-base font-semibold mb-2">سرفصلی با این عبارت پیدا نشد.</p>
            <p className="text-xs" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              لطفاً عنوان دیگری جستجو کنید یا فیلتر دسته‌بندی را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCategories.map((cat) => {
              const stats = getCategoryStats(cat.id, cat.wordCount);
              const isCurrent = selectedCategory?.id === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`group rounded-3xl p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 ${
                    isCurrent ? 'ring-2 ring-[var(--md-sys-color-primary)]' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                >
                  <div>
                    {/* Header: Icon & Badges */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-xs"
                        style={{
                          backgroundColor: 'var(--md-sys-color-primary-container)',
                          color: 'var(--md-sys-color-on-primary-container)',
                        }}
                      >
                        <DynamicIcon name={cat.icon} className="w-6 h-6" />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--md-sys-color-surface-container-high)',
                            color: 'var(--md-sys-color-on-surface-variant)',
                          }}
                        >
                          {cat.level}
                        </span>
                        <span
                          className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--md-sys-color-secondary-container)',
                            color: 'var(--md-sys-color-on-secondary-container)',
                          }}
                        >
                          {cat.wordCount.toLocaleString('fa-IR')} لغت
                        </span>
                      </div>
                    </div>

                    {/* Titles & Description */}
                    <h3 className="text-base sm:text-lg font-black mb-1 leading-snug group-hover:text-[var(--md-sys-color-primary)] transition-colors">
                      {cat.title}
                    </h3>
                    <p
                      className="text-xs font-mono font-semibold tracking-wide mb-2 opacity-80"
                      style={{ color: 'var(--md-sys-color-primary)' }}
                    >
                      {cat.englishTitle}
                    </p>
                    <p
                      className="text-xs line-clamp-2 leading-relaxed mb-4 font-normal"
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    >
                      {cat.description}
                    </p>
                  </div>

                  <div>
                    {/* Progress Bar (M3 Linear Progress) */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                          میزان مرور و تسلط
                        </span>
                        <span className="font-extrabold">{stats.percentage}%</span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${stats.percentage}%`,
                            backgroundColor:
                              stats.percentage > 50
                                ? 'var(--md-sys-color-success)'
                                : 'var(--md-sys-color-primary)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}>
                      <button
                        onClick={() => onSelectCategory(cat, 'flashcard')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-extrabold transition-all shadow-xs hover:shadow-sm cursor-pointer"
                        style={{
                          backgroundColor: 'var(--md-sys-color-primary)',
                          color: 'var(--md-sys-color-on-primary)',
                        }}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>فلش‌کارت و مرور</span>
                      </button>

                      <button
                        onClick={() => onSelectCategory(cat, 'quiz')}
                        className="p-2.5 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border"
                        style={{
                          borderColor: 'var(--md-sys-color-outline-variant)',
                          color: 'var(--md-sys-color-on-surface)',
                        }}
                        title="آزمون چهارگزینه‌ای این سرفصل"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSelectCategory(cat, 'wordlist')}
                        className="p-2.5 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border"
                        style={{
                          borderColor: 'var(--md-sys-color-outline-variant)',
                          color: 'var(--md-sys-color-on-surface)',
                        }}
                        title="فهرست و جستجوی تمام واژگان"
                      >
                        <ListFilter className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
