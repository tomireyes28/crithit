'use client';

import React from 'react';
import Link from 'next/link';
import { Award, BookOpen, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { FadeIn } from '@/components/ui/MotionWrapper';

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <FadeIn className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al Inicio
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-tertiary/20 border border-brand-tertiary/40 flex items-center justify-center text-brand-tertiary">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Pautas de Crítica y Reseñas</h1>
            <p className="text-xs text-brand-muted">Criterio, respeto y pasión por el videojuego</p>
          </div>
        </div>
      </FadeIn>

      <div className="glass-panel p-8 rounded-3xl border border-brand-border/60 space-y-6 text-sm text-brand-muted leading-relaxed">
        <section className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            1. Argumentación vs Insultos
          </h3>
          <p>
            No exigimos que te guste un juego universalmente aclamado, pero sí que tus opiniones estén fundamentadas en mecánicas, diseño, rendimiento o narrativa. El review bombing coordinado no está permitido.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            2. Etiquetado Obligatorio de Spoilers
          </h3>
          <p>
            Si revelas giros fundamentales de la trama, desenlaces o muertes de personajes, debes activar siempre la casilla de Spoilers para no arruinar la experiencia a otros jugadores.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            3. La Escala 0 a 100 de CritHit
          </h3>
          <p>
            Te alentamos a utilizar la totalidad del espectro. Un 70 no es un mal juego; es un título sólido y disfrutable. Reserva las puntuaciones 95+ para obras maestras que hayan redefinido su género.
          </p>
        </section>
      </div>
    </div>
  );
}
