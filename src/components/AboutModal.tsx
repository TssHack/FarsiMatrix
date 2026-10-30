'use client';

import React from 'react';
import Image from 'next/image';
import { Dialog } from './m3/Dialog';
import { Button } from './m3/Button';
import { Icon } from './m3/Icon';
import { Tag } from './m3/Chip';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstall: boolean;
  onInstallPWA: () => void;
}

function LinkItem({ href, icon, headline, supporting }: { href: string; icon: string; headline: string; supporting: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-ripple
      className="state-layer flex items-center gap-4 rounded-shape-lg px-4 py-3 text-on-surface cursor-pointer"
    >
      <span className="relative z-[2] grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">
        <Icon name={icon} size={22} />
      </span>
      <span className="relative z-[2] min-w-0 flex-1">
        <span className="block text-body-l text-on-surface">{headline}</span>
        <span className="block truncate text-body-m text-on-surface-variant">{supporting}</span>
      </span>
      <Icon name="open_in_new" size={20} className="relative z-[2] text-on-surface-variant" />
    </a>
  );
}

export function AboutModal({ isOpen, onClose, canInstall, onInstallPWA }: AboutModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      headline={<span className="block text-center">فارسی ماتریکس</span>}
      hero={
        <div className="mb-4 flex flex-col items-center gap-3">
          <Image src="/icons/icon.svg" alt="" width={88} height={88} unoptimized className="animate-pop-in" />
        </div>
      }
      actions={
        <>
          {canInstall && (
            <Button variant="tonal" icon="install_mobile" onClick={onInstallPWA}>
              نصب اپلیکیشن
            </Button>
          )}
          <Button variant="text" onClick={onClose} data-autofocus>
            بستن
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-center text-body-m">
          یادگیری و مرور هوشمند لغات تخصصی انگلیسی با جعبه لایتنر، آزمون تعاملی و تلفظ صوتی — متن‌باز، رایگان و کاملاً آفلاین.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Tag icon="cloud_off" tone="secondary">
            آفلاین
          </Tag>
          <Tag icon="lock" tone="secondary">
            داده‌ها روی دستگاه شما
          </Tag>
          <Tag icon="code" tone="secondary">
            متن‌باز (MIT)
          </Tag>
        </div>

        <div className="-mx-2 space-y-1">
          <LinkItem href="https://ehsanfazli.ir" icon="person" headline="احسان فضلی" supporting="طراح و توسعه‌دهنده · ehsanfazli.ir" />
          <LinkItem
            href="https://github.com/TssHack/FarsiMatrix"
            icon="code"
            headline="مخزن گیت‌هاب"
            supporting="TssHack/FarsiMatrix"
          />
        </div>

        <p className="flex items-center justify-center gap-1 text-body-s text-on-surface-variant">
          <span>ساخته شده با</span>
          <Icon name="favorite" size={16} filled className="text-error" />
          <span>برای زبان‌آموزان فارسی‌زبان</span>
        </p>
      </div>
    </Dialog>
  );
}
