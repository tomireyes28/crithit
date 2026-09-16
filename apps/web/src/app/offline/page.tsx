'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, Gamepad2 } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-brand-surface/60 border border-brand-border flex items-center justify-center shadow-2xl backdrop-blur-md">
          <WifiOff className="w-12 h-12 text-rose-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-glow-primary">
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-3">
        MODO SIN CONEXIÓN
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
        Has perdido la conexión
      </h1>

      <p className="text-sm text-brand-muted max-w-md mb-8 leading-relaxed">
        No se pudo conectar con los servidores de <strong className="text-white">CritHit</strong>.
        Comprueba tu conexión a internet o reconéctate a tu red Wi-Fi para seguir explorando y registrando partidas.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleReload}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent text-brand-bg hover:brightness-110 shadow-glow-accent transition-all flex items-center gap-2 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar Conexión</span>
        </button>

        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-surface hover:bg-brand-border/60 border border-brand-border text-brand-text transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Ir a la Portada</span>
        </Link>
      </div>
    </div>
  );
}
