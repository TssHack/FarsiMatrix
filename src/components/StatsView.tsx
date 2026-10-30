'use client';

import React, { useMemo, useRef, useState } from 'react';
import { UserProgress, Category } from '@/types';
import { sanitizeImportedProgress } from '@/lib/storage';
import { fa, faPercent } from '@/lib/format';
import { Icon } from './m3/Icon';
import { Button } from './m3/Button';
import { Dialog } from './m3/Dialog';
import { CircularProgress } from './m3/Progress';
import { Shape } from './m3/Shape';
import { useSnackbar } from './m3/Snackbar';

interface StatsViewProps {
  progress: UserProgress;
  categories: Category[];
  onResetProgress: () => void;
  onImportProgress: (imported: UserProgress) => void;
  onStartStudy: () => void;
}

const BOX_LABELS = ['تازه', 'مرور ۱', 'مرور ۲', 'تثبیت', 'دائمی'];

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: 'success' | 'secondary' | 'tertiary' | 'primary';
}) {
  const tones = {
    success: 'bg-success-container text-on-success-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    tertiary: 'bg-tertiary-container text-on-tertiary-container',
    primary: 'bg-primary-container text-on-primary-container',
  };
  return (
    <div className={`flex flex-col justify-between gap-6 rounded-shape-xl p-5 ${tones[tone]}`}>
      <Icon name={icon} size={28} />
      <div>
        <p className="text-display-s font-bold">{value}</p>
        <p className="text-label-l opacity-80">{label}</p>
      </div>
    </div>
  );
}

export function StatsView({ progress, categories, onResetProgress, onImportProgress, onStartStudy }: StatsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const showSnackbar = useSnackbar();

  const learned = Object.values(progress.learnedWords);
  const totalReviewed = learned.length;
  const masteredCount = learned.filter((w) => w.box >= 4).length;
  const inProgressCount = totalReviewed - masteredCount;
  const boxCounts = [1, 2, 3, 4, 5].map((b) => learned.filter((w) => w.box === b).length);
  const maxBox = Math.max(1, ...boxCounts);
  const quizAccuracy = progress.quizStats.totalQuestions > 0 ? progress.quizStats.correctAnswers / progress.quizStats.totalQuestions : 0;

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const id of Object.keys(progress.learnedWords)) {
      const cat = id.slice(0, id.lastIndexOf('_'));
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, count]) => ({ cat: categories.find((c) => c.id === id), count }))
      .filter((x): x is { cat: Category; count: number } => !!x.cat);
  }, [progress.learnedWords, categories]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farsimatrix-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showSnackbar('فایل پشتیبان ذخیره شد', { icon: 'download' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = sanitizeImportedProgress(JSON.parse(String(event.target?.result ?? '')));
        if (!imported) throw new Error('invalid');
        onImportProgress(imported);
        showSnackbar(`اطلاعات بازیابی شد — ${fa(Object.keys(imported.learnedWords).length)} واژه`, { icon: 'check_circle' });
      } catch {
        showSnackbar('این فایل پشتیبان معتبر نیست', { icon: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Streak hero */}
      <section className="relative overflow-hidden rounded-shape-xl bg-flame-container p-6 text-on-flame-container sm:p-8 animate-rise-in">
        <Shape kind="burst" size={240} className="pointer-events-none absolute -end-16 -top-16 text-flame opacity-15" spin />
        <div className="relative flex items-center gap-5">
          <Shape kind="cookie9" size={80} className="text-flame">
            <Icon name="local_fire_department" size={40} filled className="text-on-flame" />
          </Shape>
          <div className="min-w-0 flex-1">
            <p className="text-label-l opacity-80">استریک مطالعه</p>
            <p className="text-display-m font-bold leading-tight">{fa(progress.dailyStreak.count)} روز</p>
            <p className="text-body-m opacity-80">
              {progress.dailyStreak.count > 0 ? 'هر روز کمی مرور، زنجیره را ادامه بده!' : 'امروز اولین مرورت را شروع کن.'}
            </p>
          </div>
        </div>
        <div className="relative mt-5">
          <Button icon="play_arrow" iconFilled onClick={onStartStudy} className="!bg-flame !text-on-flame">
            شروع مرور امروز
          </Button>
        </div>
      </section>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatTile icon="workspace_premium" label="واژه‌های مسلط" value={fa(masteredCount)} tone="success" />
        <StatTile icon="school" label="در حال یادگیری" value={fa(inProgressCount)} tone="secondary" />
        <StatTile icon="history" label="کل مرورشده‌ها" value={fa(totalReviewed)} tone="primary" />
        <div className="flex flex-col items-center justify-center gap-2 rounded-shape-xl bg-tertiary-container p-5 text-on-tertiary-container">
          <CircularProgress value={quizAccuracy} size={84} thickness={8} label="دقت آزمون‌ها" indicatorClassName="text-tertiary">
            <span className="text-title-m font-bold">{faPercent(quizAccuracy)}</span>
          </CircularProgress>
          <p className="text-label-l opacity-80">دقت در {fa(progress.quizStats.totalQuizzes)} آزمون</p>
        </div>
      </div>

      {/* Leitner distribution */}
      <section className="rounded-shape-xl bg-surface-container-low p-6">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="flex items-center gap-2 text-title-l text-on-surface">
            <Icon name="inventory_2" className="text-primary" />
            جعبه لایتنر
          </h3>
          <span className="text-body-m text-on-surface-variant">{fa(totalReviewed)} واژه در گردش</span>
        </div>
        <div className="flex h-56 items-end gap-3 sm:gap-6" role="list" aria-label="توزیع واژه‌ها در جعبه‌های لایتنر">
          {boxCounts.map((count, idx) => {
            const height = count === 0 ? 4 : Math.max(10, (count / maxBox) * 100);
            const mastered = idx >= 3;
            return (
              <div key={idx} role="listitem" className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-label-l text-on-surface">{fa(count)}</span>
                <div
                  className={`w-full max-w-16 rounded-shape-md transition-[height] duration-700 ease-spring ${
                    mastered ? 'bg-success' : idx === 0 ? 'bg-outline-variant' : 'bg-primary'
                  }`}
                  style={{ height: `${height}%`, opacity: mastered ? 1 : 0.55 + idx * 0.15 }}
                />
                <span className="text-center text-label-m text-on-surface-variant">
                  {fa(idx + 1)}
                  <span className="block text-label-s">{BOX_LABELS[idx]}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top categories */}
      {topCategories.length > 0 && (
        <section className="rounded-shape-xl bg-surface-container-low p-6">
          <h3 className="mb-4 text-title-l text-on-surface">سرفصل‌های پرتمرین</h3>
          <ul className="space-y-4">
            {topCategories.map(({ cat, count }) => {
              const ratio = Math.min(1, count / Math.max(1, cat.wordCount));
              return (
                <li key={cat.id}>
                  <div className="mb-1.5 flex justify-between text-body-m">
                    <span className="text-on-surface">{cat.title}</span>
                    <span className="text-on-surface-variant">
                      {fa(count)} از {fa(cat.wordCount)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-secondary-container">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-700 ease-emphasized"
                      style={{ width: `${Math.max(2, ratio * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Backup */}
      <section className="rounded-shape-xl bg-surface-container-low p-6">
        <h3 className="flex items-center gap-2 text-title-l text-on-surface">
          <Icon name="backup" className="text-primary" />
          پشتیبان‌گیری
        </h3>
        <p className="mt-2 text-body-m text-on-surface-variant">
          همه اطلاعات فقط روی همین دستگاه ذخیره می‌شود. برای انتقال به مرورگر یا دستگاه دیگر، فایل پشتیبان بگیرید.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button icon="download" onClick={handleExport}>
            دریافت فایل پشتیبان
          </Button>
          <Button variant="outlined" icon="upload" onClick={() => fileInputRef.current?.click()}>
            بازیابی از فایل
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleImportFile} accept="application/json,.json" className="hidden" />
          <Button variant="text" icon="delete_forever" className="!text-error ms-auto" onClick={() => setConfirmResetOpen(true)}>
            شروع از صفر
          </Button>
        </div>
      </section>

      <Dialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        icon="delete_forever"
        iconClassName="text-error"
        headline="همه پیشرفت پاک شود؟"
        actions={
          <>
            <Button variant="text" onClick={() => setConfirmResetOpen(false)} data-autofocus>
              انصراف
            </Button>
            <Button
              variant="text"
              className="!text-error"
              onClick={() => {
                onResetProgress();
                setConfirmResetOpen(false);
                showSnackbar('تاریخچه یادگیری پاک شد', { icon: 'delete_forever' });
              }}
            >
              پاک کردن
            </Button>
          </>
        }
      >
        <p className="text-center">
          وضعیت جعبه لایتنر، واژه‌های نشان‌شده، استریک و آمار آزمون‌ها برای همیشه حذف می‌شوند. پیشنهاد می‌کنیم قبلش فایل پشتیبان بگیرید.
        </p>
      </Dialog>
    </div>
  );
}
