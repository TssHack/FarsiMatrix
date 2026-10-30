'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

interface SnackbarOptions {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  icon?: string;
}

interface SnackbarItem extends SnackbarOptions {
  id: number;
  message: string;
}

type ShowSnackbar = (message: string, options?: SnackbarOptions) => void;

const SnackbarContext = createContext<ShowSnackbar>(() => {});

export function useSnackbar() {
  return useContext(SnackbarContext);
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<SnackbarItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const show = useCallback<ShowSnackbar>((message, options = {}) => {
    if (timer.current) clearTimeout(timer.current);
    counter.current += 1;
    setItem({ id: counter.current, message, ...options });
    timer.current = setTimeout(() => setItem(null), options.duration ?? 4000);
  }, []);

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      {item &&
        createPortal(
          <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 z-[80] flex justify-center px-4 bottom-[calc(96px+env(safe-area-inset-bottom,0px))] sm:bottom-6 sm:justify-start sm:ps-[120px]"
          >
            {(
              <div
                key={item.id}
                role="status"
                className="pointer-events-auto flex min-h-12 w-full max-w-[560px] items-center gap-3 rounded-shape-xs bg-inverse-surface py-2 ps-4 pe-2 text-body-m text-inverse-on-surface shadow-elevation-3 animate-snackbar-in sm:w-auto sm:min-w-[344px]"
              >
                {item.icon && <Icon name={item.icon} size={20} className="text-inverse-primary" />}
                <span className="flex-1 py-1">{item.message}</span>
                {item.actionLabel && (
                  <button
                    type="button"
                    data-ripple
                    className="state-layer h-10 rounded-full px-3 text-label-l text-inverse-primary cursor-pointer"
                    onClick={() => {
                      item.onAction?.();
                      setItem(null);
                    }}
                  >
                    <span className="relative z-[2]">{item.actionLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  aria-label="بستن پیام"
                  data-ripple
                  className="state-layer grid h-10 w-10 place-items-center rounded-full cursor-pointer"
                  onClick={() => setItem(null)}
                >
                  <Icon name="close" size={20} className="relative z-[2]" />
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </SnackbarContext.Provider>
  );
}
