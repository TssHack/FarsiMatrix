'use client';

import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  headline: React.ReactNode;
  icon?: string;
  iconClassName?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  hero?: React.ReactNode;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** MD3 basic dialog: scrim, extra-large corners, surface-container-high, end-aligned actions. */
export function Dialog({ open, onClose, headline, icon, iconClassName = 'text-secondary', children, actions, className = '', hero }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstItem) {
          e.preventDefault();
          lastItem.focus();
        } else if (!e.shiftKey && document.activeElement === lastItem) {
          e.preventDefault();
          firstItem.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] grid place-items-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-scrim/40 animate-scrim-in pointer-events-none" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex w-full max-w-[560px] min-w-[280px] max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-shape-xl bg-surface-container-high text-on-surface shadow-elevation-3 animate-dialog-in ${className}`}
      >
        <div className="overflow-y-auto p-6">
          {hero}
          {icon && (
            <div className="mb-4 flex justify-center">
              <Icon name={icon} size={24} className={iconClassName} />
            </div>
          )}
          <h2 id={titleId} className={`text-headline-s text-on-surface ${icon ? 'text-center' : ''}`}>
            {headline}
          </h2>
          {children && <div className="mt-4 text-body-m text-on-surface-variant">{children}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center justify-end gap-2 px-6 pb-6">{actions}</div>}
      </div>
    </div>,
    document.body
  );
}
