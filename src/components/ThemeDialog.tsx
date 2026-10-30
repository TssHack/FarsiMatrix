'use client';

import React, { useMemo } from 'react';
import { Dialog } from './m3/Dialog';
import { Button } from './m3/Button';
import { SegmentedButton } from './m3/SegmentedButton';
import { FilterChip } from './m3/Chip';
import { Icon } from './m3/Icon';
import {
  buildTokens,
  ContrastLevel,
  DEFAULT_THEME,
  resolveIsDark,
  SchemeVariant,
  SEED_OPTIONS,
  ThemeMode,
  ThemeSettings,
} from '@/lib/theme';

interface ThemeDialogProps {
  open: boolean;
  onClose: () => void;
  settings: ThemeSettings;
  onChange: (settings: ThemeSettings) => void;
}

const VARIANTS: { value: SchemeVariant; label: string }[] = [
  { value: 'tonal', label: 'ملایم' },
  { value: 'vibrant', label: 'پرانرژی' },
  { value: 'expressive', label: 'بیانگر' },
  { value: 'content', label: 'وفادار به رنگ' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-title-s text-on-surface">{children}</h3>;
}

export function ThemeDialog({ open, onClose, settings, onChange }: ThemeDialogProps) {
  const isDark = open ? resolveIsDark(settings.mode) : false;

  const swatches = useMemo(
    () =>
      open
        ? SEED_OPTIONS.map((seed) => ({
            seed,
            tokens: buildTokens({ ...settings, seed: seed.hex }, isDark),
          }))
        : [],
    [open, settings, isDark]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon="palette"
      headline="شخصی‌سازی ظاهر"
      actions={
        <>
          <Button variant="text" onClick={() => onChange(DEFAULT_THEME)}>
            بازنشانی
          </Button>
          <Button variant="text" onClick={onClose} data-autofocus>
            تمام
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <p className="text-center">رنگ‌بندی کل برنامه با «رنگ پویا»ی متریال ۳ از یک رنگ پایه ساخته می‌شود.</p>

        <section>
          <SectionTitle>حالت نمایش</SectionTitle>
          <SegmentedButton<ThemeMode>
            ariaLabel="حالت نمایش"
            value={settings.mode}
            onChange={(mode) => onChange({ ...settings, mode })}
            options={[
              { value: 'light', label: 'روشن', icon: 'light_mode' },
              { value: 'system', label: 'خودکار', icon: 'brightness_auto' },
              { value: 'dark', label: 'تیره', icon: 'dark_mode' },
            ]}
          />
        </section>

        <section>
          <SectionTitle>رنگ پایه</SectionTitle>
          <div role="radiogroup" aria-label="رنگ پایه" className="grid grid-cols-4 gap-x-2 gap-y-4">
            {swatches.map(({ seed, tokens }) => {
              const selected = settings.seed.toLowerCase() === seed.hex.toLowerCase();
              return (
                <button
                  key={seed.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={seed.label}
                  onClick={() => onChange({ ...settings, seed: seed.hex })}
                  className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-shape-md"
                >
                  <span
                    className={`relative grid h-14 w-14 place-items-center overflow-hidden rounded-full transition-transform duration-300 ease-spring-fast group-active:scale-90 ${
                      selected ? 'ring-[3px] ring-on-surface ring-offset-2 ring-offset-surface-container-high' : ''
                    }`}
                  >
                    <span className="absolute inset-x-0 top-0 h-1/2" style={{ background: tokens.primary }} />
                    <span className="absolute bottom-0 end-0 h-1/2 w-1/2" style={{ background: tokens['secondary-container'] }} />
                    <span className="absolute bottom-0 start-0 h-1/2 w-1/2" style={{ background: tokens['tertiary-container'] }} />
                    {selected && (
                      <span
                        className="relative grid h-7 w-7 place-items-center rounded-full animate-pop-in"
                        style={{ background: tokens['primary-container'], color: tokens['on-primary-container'] }}
                      >
                        <Icon name="check" size={18} weight={600} />
                      </span>
                    )}
                  </span>
                  <span className={`text-label-m ${selected ? 'text-on-surface' : 'text-on-surface-variant'}`}>{seed.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <SectionTitle>سبک رنگ‌بندی</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((v) => (
              <FilterChip
                key={v.value}
                label={v.label}
                selected={settings.variant === v.value}
                onClick={() => onChange({ ...settings, variant: v.value })}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>کنتراست</SectionTitle>
          <SegmentedButton<ContrastLevel>
            ariaLabel="سطح کنتراست"
            value={settings.contrast}
            onChange={(contrast) => onChange({ ...settings, contrast })}
            options={[
              { value: 0, label: 'استاندارد' },
              { value: 0.5, label: 'متوسط' },
              { value: 1, label: 'بالا' },
            ]}
          />
        </section>
      </div>
    </Dialog>
  );
}
