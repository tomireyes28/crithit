'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registrado:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Error registrando Service Worker:', err);
        });
    }
  }, []);

  return null;
}
