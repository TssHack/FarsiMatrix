'use client';

import { useEffect } from 'react';

/** Delegated MD3 ripple for any element with `data-ripple`. */
export function RippleProvider() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handlePointerDown = (e: PointerEvent) => {
      if (reduceMotion.matches || e.button !== 0) return;
      const host = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-ripple]');
      if (!host || host.hasAttribute('disabled') || host.getAttribute('aria-disabled') === 'true') return;

      let container = host.querySelector<HTMLSpanElement>(':scope > .m3-ripple-container');
      if (!container) {
        container = document.createElement('span');
        container.className = 'm3-ripple-container';
        Object.assign(container.style, {
          position: 'absolute',
          inset: '0',
          borderRadius: 'inherit',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: '1',
        });
        host.appendChild(container);
      }

      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
      const ripple = document.createElement('span');
      ripple.className = 'm3-ripple';
      Object.assign(ripple.style, {
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        left: `${x - radius}px`,
        top: `${y - radius}px`,
      });
      container.appendChild(ripple);

      const grow = ripple.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
        duration: 450,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        fill: 'forwards',
      });

      const release = () => {
        window.removeEventListener('pointerup', release);
        window.removeEventListener('pointercancel', release);
        grow.finished
          .catch(() => undefined)
          .then(() => ripple.animate([{ opacity: 0.14 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).finished)
          .catch(() => undefined)
          .then(() => ripple.remove());
      };
      window.addEventListener('pointerup', release);
      window.addEventListener('pointercancel', release);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return null;
}
