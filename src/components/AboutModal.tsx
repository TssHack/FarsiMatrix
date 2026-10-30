'use client';

import React, { useEffect, useRef } from 'react';
import {
  X,
  Globe,
  ExternalLink,
  Sparkles,
  Download,
  Heart,
  User,
  ShieldCheck,
  BookOpen,
  Award
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPWA: () => void;
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

export function AboutModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPWA,
}: AboutModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = 'about-modal-title';

  // Lock body scroll, move focus into the dialog, and close on Escape while open
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-scrim-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-xl max-h-[90vh] overflow-y-auto space-y-6 animate-dialog-in"
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
          aria-label="بستن"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs flex-shrink-0"
            style={{
              backgroundColor: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
            }}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 id={titleId} className="text-xl font-extrabold">درباره فارسی ماتریکس</h3>
            <p className="text-xs font-medium opacity-70">
              سامانه هوشمند یادگیری لغات و جعبه لایتنر با متریال دیزاین ۳
            </p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <strong>فارسی ماتریکس (FarsiMatrix)</strong> پلتفرمی متن‌باز و مدرن برای یادگیری، مرور زمان‌دار و حفظ واژگان تخصصی انگلیسی به فارسی است. این نسخه با معماری <strong>Serverless و Local-first</strong> بدون نیاز به دیتابیس ابری هزینه‌بر، به صورت کاملاً مستقل و آفلاین (PWA) در دستگاه کاربر اجرا می‌شود.
        </p>

        {/* Developer Card (M3 Expressive Card) */}
        <div
          className="p-5 rounded-2xl border space-y-3"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 opacity-80">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>توسعه‌دهنده و سازنده</span>
            </span>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
              }}
            >
              Developer
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-extrabold">احسان فضلی (Ehsan Fazli)</h4>
              <p className="text-xs opacity-75 mt-0.5">طراح سیستم و توسعه‌دهنده نرم‌افزار</p>
            </div>
            <a
              href="https://ehsanfazli.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-105 cursor-pointer shadow-xs"
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ehsanfazli.ir</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Repository & Open Source Card */}
        <div
          className="p-5 rounded-2xl border space-y-3"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 opacity-80">
              <GithubIcon className="w-4 h-4" />
              <span>سورس کد و مخزن ریپوزیتوری</span>
            </span>
            <span className="text-[11px] font-mono opacity-60">MIT License</span>
          </div>

          <p className="text-xs opacity-75 leading-relaxed">
            این پروژه به صورت اوپن‌سورس و با هدف کمک به جامعه فارسی‌زبان در یادگیری زبان و اصطلاحات تخصصی توسعه یافته است.
          </p>

          <a
            href="https://github.com/TssHack/FarsiMatrix"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-xs font-bold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            style={{
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            <GithubIcon className="w-4 h-4" />
            <span>مشاهده مخزن در گیت‌هاب (TssHack/FarsiMatrix)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 mr-1" />
          </a>
        </div>

        {/* PWA Install Button (if prompt ready) */}
        {deferredPrompt && (
          <button
            onClick={onInstallPWA}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--md-sys-color-tertiary-container)',
              color: 'var(--md-sys-color-on-tertiary-container)',
            }}
          >
            <Download className="w-4 h-4" />
            <span>نصب اپلیکیشن روی دستگاه (PWA Web App)</span>
          </button>
        )}

        {/* Footer Note */}
        <div className="text-center text-[11px] opacity-60 pt-2 flex items-center justify-center gap-1">
          <span>ساخته شده با</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>برای جامعه علمی و زبان‌آموزان فارسی‌زبان</span>
        </div>
      </div>
    </div>
  );
}
