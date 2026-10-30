'use client';

import React from 'react';
import { ActiveTab, UserProgress } from '@/types';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  ListFilter, 
  BarChart3, 
  Flame, 
  Moon, 
  Sun,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  progress: UserProgress;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  selectedCategoryTitle?: string;
}

export function Navbar({
  activeTab,
  setActiveTab,
  progress,
  isDark,
  setIsDark,
  selectedCategoryTitle,
}: NavbarProps) {
  const tabs = [
    { id: 'categories' as ActiveTab, label: 'سرفصل‌ها', icon: Layers },
    { id: 'flashcard' as ActiveTab, label: 'فلش‌کارت و مرور', icon: BookOpen },
    { id: 'quiz' as ActiveTab, label: 'آزمون تعاملی', icon: HelpCircle },
    { id: 'wordlist' as ActiveTab, label: 'فهرست واژگان', icon: ListFilter },
    { id: 'stats' as ActiveTab, label: 'آمار پیشرفت', icon: BarChart3 },
  ];

  const masteredCount = Object.values(progress.learnedWords).filter((w) => w.box >= 4).length;

  return (
    <>
      {/* Top App Bar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--md-sys-color-surface) 92%, transparent)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('categories')}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">فارسی ماتریکس</span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                  }}
                >
                  M3
                </span>
              </div>
              <p
                className="text-xs truncate max-w-[200px] sm:max-w-none"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {selectedCategoryTitle ? `سرفصل: ${selectedCategoryTitle}` : 'سامانه هوشمند حفظ و مرور لغات'}
              </p>
            </div>
          </div>

          {/* Center Navigation for Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive ? 'shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? 'var(--md-sys-color-secondary-container)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--md-sys-color-on-secondary-container)'
                      : 'var(--md-sys-color-on-surface-variant)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Streak & Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-transform hover:scale-105"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                color: 'var(--md-sys-color-on-surface)',
                border: '1px solid var(--md-sys-color-outline-variant)',
              }}
              title={`استریک مطالعه روزانه: ${progress.dailyStreak.count} روز | ${masteredCount} لغت مسلط شده`}
              onClick={() => setActiveTab('stats')}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{progress.dailyStreak.count} روز</span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                color: 'var(--md-sys-color-on-surface-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container)',
              }}
              aria-label="تغییر تم"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (M3 Standard) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg flex justify-around items-center px-2 py-1 shadow-lg"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--md-sys-color-surface-container) 95%, transparent)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 cursor-pointer transition-all"
            >
              <div
                className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
                  isActive ? 'scale-105' : ''
                }`}
                style={{
                  backgroundColor: isActive
                    ? 'var(--md-sys-color-primary-container)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface-variant)',
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] mt-1 font-medium ${
                  isActive ? 'font-bold' : ''
                }`}
                style={{
                  color: isActive
                    ? 'var(--md-sys-color-on-surface)'
                    : 'var(--md-sys-color-on-surface-variant)',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
