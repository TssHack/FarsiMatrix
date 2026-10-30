'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('FarsiMatrix PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
