'use client';

import React, { useRef } from 'react';
import { UserProgress, Category } from '@/types';
import { 
  Flame, 
  Trophy, 
  BookOpen, 
  CheckCircle, 
  Layers, 
  Download, 
  Upload, 
  Trash2, 
  Award,
  Sparkles
} from 'lucide-react';

interface StatsViewProps {
  progress: UserProgress;
  categories: Category[];
  onResetProgress: () => void;
  onImportProgress: (imported: UserProgress) => void;
  onStartStudy: () => void;
}

export function StatsView({
  progress,
  categories,
  onResetProgress,
  onImportProgress,
  onStartStudy,
}: StatsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalReviewed = Object.keys(progress.learnedWords).length;
  const masteredCount = Object.values(progress.learnedWords).filter((w) => w.box >= 4).length;
  const inProgressCount = totalReviewed - masteredCount;

  // Box distribution
  const boxCounts = [1, 2, 3, 4, 5].map(
    (b) => Object.values(progress.learnedWords).filter((w) => w.box === b).length
  );

  const quizAccuracy =
    progress.quizStats.totalQuestions > 0
      ? Math.round((progress.quizStats.correctAnswers / progress.quizStats.totalQuestions) * 100)
      : 0;

  // Export JSON backup
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `farsimatrix_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          onImportProgress(parsed);
          alert('اطلاعات با موفقیت بازیابی شد.');
        }
      } catch (err) {
        alert('فایل پشتیبان نامعتبر است.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black mb-1">گزارش و پیشرفت تحصیلی من</h2>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          اطلاعات به طور کاملاً محلی (Local) در مرورگر شما ذخیره شده و هیچ وابستگی به سرور خارجی ندارد.
        </p>
      </div>

      {/* Main KPI Cards Grid (M3 Expressive) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div
          className="p-5 rounded-3xl border flex flex-col justify-between shadow-xs"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 mb-3">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs opacity-75 font-medium block mb-1">استریک مطالعه</span>
            <span className="text-2xl sm:text-3xl font-black">{progress.dailyStreak.count} روز</span>
          </div>
        </div>

        {/* Mastered Words */}
        <div
          className="p-5 rounded-3xl border flex flex-col justify-between shadow-xs"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs opacity-75 font-medium block mb-1">لغات مسلط شده</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {masteredCount.toLocaleString('fa-IR')}
            </span>
          </div>
        </div>

        {/* Words In Learning */}
        <div
          className="p-5 rounded-3xl border flex flex-col justify-between shadow-xs"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs opacity-75 font-medium block mb-1">در حال یادگیری</span>
            <span className="text-2xl sm:text-3xl font-black">
              {inProgressCount.toLocaleString('fa-IR')}
            </span>
          </div>
        </div>

        {/* Quiz Accuracy */}
        <div
          className="p-5 rounded-3xl border flex flex-col justify-between shadow-xs"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs opacity-75 font-medium block mb-1">دقت آزمون‌ها</span>
            <span className="text-2xl sm:text-3xl font-black">{quizAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* Leitner Boxes Distribution Card */}
      <div
        className="p-6 sm:p-8 rounded-3xl border space-y-4 shadow-xs"
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>توزیع لغات در جعبه لایتنر (۵ مرحله‌ای)</span>
          </h3>
          <span className="text-xs opacity-70">
            مجموع لغات در گردش: {totalReviewed.toLocaleString('fa-IR')}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-2">
          {boxCounts.map((count, idx) => {
            const boxNum = idx + 1;
            const isMasteredBox = boxNum >= 4;
            return (
              <div
                key={boxNum}
                className="p-3 sm:p-4 rounded-2xl border text-center space-y-1 transition-transform hover:scale-105"
                style={{
                  backgroundColor: isMasteredBox
                    ? 'var(--md-sys-color-success-container)'
                    : 'var(--md-sys-color-surface-container)',
                  color: isMasteredBox
                    ? 'var(--md-sys-color-on-success-container)'
                    : 'var(--md-sys-color-on-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
              >
                <span className="text-[10px] sm:text-xs block opacity-75 font-semibold">
                  جعبه {boxNum}
                </span>
                <span className="text-lg sm:text-2xl font-black block">
                  {count.toLocaleString('fa-IR')}
                </span>
                <span className="text-[9px] sm:text-[10px] opacity-70 block">
                  {boxNum === 1 ? 'مقدماتی' : boxNum === 5 ? 'دائمی' : 'مرور'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Backup & Privacy Section */}
      <div
        className="p-6 sm:p-8 rounded-3xl border space-y-4"
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
      >
        <h3 className="text-base font-extrabold">پشتیبان‌گیری و انتقال اطلاعات (حفظ کامل داده‌ها)</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          شما می‌توانید از روند یادگیری، لغات حفظ شده و وضعیت جعبه لایتنر خود خروجی JSON بگیرید تا در مرورگر دیگر یا هر زمان دیگری آن را بازیابی کنید.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-xs cursor-pointer"
            style={{
              backgroundColor: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
            }}
          >
            <Download className="w-4 h-4" />
            <span>دانلود فایل پشتیبان (Export JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
          >
            <Upload className="w-4 h-4" />
            <span>بازیابی اطلاعات (Import JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => {
              if (confirm('آیا از بازنشانی کامل تاریخچه یادگیری اطمینان دارید؟')) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer mr-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>شروع از صفر</span>
          </button>
        </div>
      </div>
    </div>
  );
}
