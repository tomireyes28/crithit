'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem('crithit_pwa_dismissed');
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 7) {
        return; // Don't show if dismissed within 7 days
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] Usuario aceptó instalar CritHit');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('crithit_pwa_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2.5rem)] bg-brand-card/95 backdrop-blur-xl border border-brand-accent/40 shadow-2xl rounded-2xl p-4 overflow-hidden"
      >
        {/* Top Glow Bar */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary" />

        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shrink-0 shadow-glow-accent">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              Instala CritHit App
            </h4>
            <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">
              Accede más rápido, pantalla completa y modo sin conexión directo desde tu pantalla de inicio.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-accent text-brand-bg hover:brightness-110 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>

              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-white transition-colors"
              >
                Más tarde
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-brand-muted hover:text-white p-1 rounded-lg transition-colors -mr-1 -mt-1"
            aria-label="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
