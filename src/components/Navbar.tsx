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
  Sparkles,
  Info,
  Globe,
  ExternalLink,
  Download
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  progress: UserProgress;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  selectedCategoryTitle?: string;
  onOpenAbout: () => void;
  deferredPrompt?: any;
  onInstallPWA?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  progress,
  isDark,
  setIsDark,
  selectedCategoryTitle,
  onOpenAbout,
  deferredPrompt,
  onInstallPWA,
}: NavbarProps) {
  const tabs = [
    { id: 'categories' as ActiveTab, label: 'سرفصل‌ها', icon: Layers },
    { id: 'flashcard' as ActiveTab, label: 'فلش‌کارت', icon: BookOpen },
    { id: 'quiz' as ActiveTab, label: 'آزمون', icon: HelpCircle },
    { id: 'wordlist' as ActiveTab, label: 'واژه‌نامه', icon: ListFilter },
    { id: 'stats' as ActiveTab, label: 'پیشرفت', icon: BarChart3 },
  ];

  const masteredCount = Object.values(progress.learnedWords).filter((w) => w.box >= 4).length;

  return (
    <>
      {/* Top App Bar (M3 Standard) */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--md-sys-color-surface) 94%, transparent)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('categories')}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs transition-transform hover:scale-105"
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight">فارسی ماتریکس</span>
                <span
                  className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                  }}
                >
                  M3
                </span>
              </div>
              <p
                className="text-[11px] truncate max-w-[130px] sm:max-w-none font-medium opacity-80"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {selectedCategoryTitle ? `سرفصل: ${selectedCategoryTitle}` : 'یادگیری و مرور لغات تخصصی'}
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive ? 'shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/5'
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

          {/* Right Controls: Developer, Streak, PWA, Theme & About */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Developer pill (desktop only) */}
            <a
              href="https://ehsanfazli.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 border cursor-pointer"
              style={{
                borderColor: 'var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                color: 'var(--md-sys-color-on-surface)',
              }}
              title="وب‌سایت شخصی احسان فضلی"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>ehsanfazli.ir</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* PWA Install Button (if available) */}
            {deferredPrompt && (
              <button
                onClick={onInstallPWA}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 cursor-pointer shadow-xs"
                style={{
                  backgroundColor: 'var(--md-sys-color-tertiary-container)',
                  color: 'var(--md-sys-color-on-tertiary-container)',
                }}
                title="نصب اپلیکیشن فارسی ماتریکس (PWA)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">نصب PWA</span>
              </button>
            )}

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black cursor-pointer transition-transform hover:scale-105"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                color: 'var(--md-sys-color-on-surface)',
                border: '1px solid var(--md-sys-color-outline-variant)',
              }}
              title={`استریک مطالعه روزانه: ${progress.dailyStreak.count} روز | ${masteredCount} لغت مسلط شده`}
              onClick={() => setActiveTab('stats')}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{progress.dailyStreak.count} روز</span>
            </div>

            {/* About & Info button */}
            <button
              onClick={onOpenAbout}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 border"
              style={{
                borderColor: 'var(--md-sys-color-outline-variant)',
                color: 'var(--md-sys-color-on-surface-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container)',
              }}
              aria-label="درباره نرم‌افزار و توسعه‌دهنده"
              title="درباره و اطلاعات توسعه‌دهنده (احسان فضلی)"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 border"
              style={{
                borderColor: 'var(--md-sys-color-outline-variant)',
                color: 'var(--md-sys-color-on-surface-variant)',
                backgroundColor: 'var(--md-sys-color-surface-container)',
              }}
              aria-label="تغییر تم"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (M3 Standard - Responsive to 360px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg flex justify-around items-center px-1 py-1 shadow-lg pb-safe"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--md-sys-color-surface-container) 96%, transparent)',
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
              className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 cursor-pointer transition-all"
            >
              <div
                className={`px-3.5 py-1 rounded-full transition-all flex items-center justify-center ${
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
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium tracking-tight ${
                  isActive ? 'font-black' : ''
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
