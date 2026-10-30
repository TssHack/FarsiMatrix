'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActiveTab } from '@/types';
import { Icon } from './m3/Icon';
import { IconButton } from './m3/Button';
import { fa } from '@/lib/format';

export const DESTINATIONS: { id: ActiveTab; label: string; icon: string }[] = [
  { id: 'categories', label: 'سرفصل‌ها', icon: 'grid_view' },
  { id: 'flashcard', label: 'فلش‌کارت', icon: 'style' },
  { id: 'quiz', label: 'آزمون', icon: 'quiz' },
  { id: 'wordlist', label: 'واژه‌نامه', icon: 'menu_book' },
  { id: 'stats', label: 'پیشرفت', icon: 'insights' },
];

const PAGE_TITLES: Record<ActiveTab, string> = {
  categories: 'سرفصل‌ها',
  flashcard: 'مرور فلش‌کارت',
  quiz: 'آزمون',
  wordlist: 'واژه‌نامه',
  stats: 'پیشرفت من',
};

interface NavProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
}

function NavIndicator({ active, icon, wide }: { active: boolean; icon: string; wide?: boolean }) {
  return (
    <span
      className={`state-layer relative grid h-8 place-items-center rounded-full transition-[background-color,width] duration-300 ease-spring-fast ${
        active
          ? `${wide ? 'w-16' : 'w-14'} bg-secondary-container text-on-secondary-container`
          : `w-8 text-on-surface-variant ${wide ? 'group-hover:w-16' : 'group-hover:w-14'}`
      }`}
    >
      <Icon name={icon} size={24} filled={active} className="relative z-[2]" />
    </span>
  );
}

/** MD3 navigation rail (medium & expanded windows) */
export function NavigationRail({
  activeTab,
  onNavigate,
  onOpenTheme,
  onOpenAbout,
  onContinue,
}: NavProps & { onOpenTheme: () => void; onOpenAbout: () => void; onContinue: () => void }) {
  return (
    <nav
      aria-label="ناوبری اصلی"
      className="fixed inset-y-0 start-0 z-40 hidden w-24 flex-col items-center bg-surface py-4 sm:flex"
    >
      <button
        type="button"
        onClick={() => onNavigate('categories')}
        className="mb-4 cursor-pointer rounded-shape-md"
        aria-label="فارسی ماتریکس — صفحه اصلی"
      >
        <Image src="/icons/icon.svg" alt="" width={44} height={44} unoptimized priority />
      </button>

      <button
        type="button"
        data-ripple
        onClick={onContinue}
        aria-label="ادامه مرور"
        title="ادامه مرور"
        className="state-layer shape-morph mb-6 grid h-14 w-14 place-items-center rounded-shape-lg bg-primary-container text-on-primary-container shadow-elevation-1 hover:shadow-elevation-2 cursor-pointer"
      >
        <Icon name="play_arrow" size={28} filled className="relative z-[2]" />
      </button>

      <div className="flex flex-1 flex-col items-center gap-3">
        {DESTINATIONS.map((d) => {
          const active = activeTab === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onNavigate(d.id)}
              aria-current={active ? 'page' : undefined}
              className="group flex w-20 cursor-pointer flex-col items-center gap-1 outline-offset-4"
            >
              <NavIndicator active={active} icon={d.icon} />
              <span className={`text-label-m ${active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{d.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2">
        <IconButton icon="palette" label="شخصی‌سازی ظاهر و رنگ" onClick={onOpenTheme} />
        <IconButton icon="info" label="درباره فارسی ماتریکس" onClick={onOpenAbout} />
      </div>
    </nav>
  );
}

/** MD3 navigation bar (compact windows) */
export function NavigationBar({ activeTab, onNavigate }: NavProps) {
  return (
    <nav
      aria-label="ناوبری اصلی"
      className="fixed inset-x-0 bottom-0 z-40 bg-surface-container pb-safe sm:hidden"
    >
      <div className="flex h-20 items-stretch">
        {DESTINATIONS.map((d) => {
          const active = activeTab === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onNavigate(d.id)}
              aria-current={active ? 'page' : undefined}
              className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 outline-offset-[-4px]"
            >
              <NavIndicator active={active} icon={d.icon} wide />
              <span className={`truncate text-label-m ${active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{d.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface TopAppBarProps {
  activeTab: ActiveTab;
  subtitle?: string;
  streak: number;
  canInstall: boolean;
  onInstall: () => void;
  onOpenTheme: () => void;
  onOpenAbout: () => void;
  onOpenStats: () => void;
  onHome: () => void;
}

/** MD3 small top app bar: flat at rest, surface-container tint once content scrolls under it */
export function TopAppBar({
  activeTab,
  subtitle,
  streak,
  canInstall,
  onInstall,
  onOpenTheme,
  onOpenAbout,
  onOpenStats,
  onHome,
}: TopAppBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 ${scrolled ? 'bg-surface-container' : 'bg-surface'}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-2 px-2 sm:px-6">
        <button
          type="button"
          onClick={onHome}
          className="flex min-w-0 items-center gap-3 rounded-shape-md p-2 text-start cursor-pointer sm:hidden"
          aria-label="فارسی ماتریکس — صفحه اصلی"
        >
          <Image src="/icons/icon.svg" alt="" width={36} height={36} unoptimized priority />
          <span className="min-w-0">
            <span className="block truncate text-title-m text-on-surface">فارسی ماتریکس</span>
            {subtitle && <span className="block truncate text-body-s text-on-surface-variant">{subtitle}</span>}
          </span>
        </button>

        <div className="hidden min-w-0 sm:block">
          <h1 className="truncate text-title-l text-on-surface">{PAGE_TITLES[activeTab]}</h1>
        </div>

        <div className="ms-auto flex items-center gap-1">
          <button
            type="button"
            data-ripple
            onClick={onOpenStats}
            title={`${fa(streak)} روز مطالعه پیاپی`}
            aria-label={`استریک مطالعه: ${fa(streak)} روز`}
            className="state-layer flex h-10 items-center gap-1 rounded-full bg-flame-container ps-2 pe-3 text-on-flame-container cursor-pointer"
          >
            <Icon name="local_fire_department" size={22} filled className="relative z-[2] text-flame" />
            <span className="relative z-[2] text-label-l">{fa(streak)}</span>
          </button>
          {canInstall && <IconButton icon="install_mobile" label="نصب اپلیکیشن" onClick={onInstall} />}
          <IconButton icon="palette" label="شخصی‌سازی ظاهر و رنگ" onClick={onOpenTheme} className="sm:hidden" />
          <IconButton icon="info" label="درباره فارسی ماتریکس" onClick={onOpenAbout} className="sm:hidden" />
        </div>
      </div>
    </header>
  );
}
