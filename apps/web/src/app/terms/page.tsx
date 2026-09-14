'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import { FadeIn } from '@/components/ui/MotionWrapper';

export default function TermsPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Términos de Servicio</h1>
            <p className="text-xs text-brand-muted">Última actualización: Septiembre 2026</p>
          </div>
        </div>
      </FadeIn>

      <div className="glass-panel p-8 rounded-3xl border border-brand-border/60 space-y-6 text-sm text-brand-muted leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-white">1. Aceptación de los Términos</h3>
          <p>
            Al registrarte y utilizar CritHit, aceptas cumplir con los presentes Términos de Servicio y con todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de ellos, no debes acceder a la plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-white">2. Uso de la Cuenta</h3>
          <p>
            Eres responsable de la seguridad de tu contraseña y de toda la actividad que ocurra bajo tu cuenta. CritHit se reserva el derecho de suspender o revocar cuentas que incumplan nuestras normas comunitarias o que manipulen de forma fraudulenta puntuaciones y exámenes de acreditación.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-white">3. Propiedad de Contenido y Reseñas</h3>
          <p>
            Tus reseñas, notas de diario y listas te pertenecen. Al publicarlas en CritHit, nos otorgas una licencia mundial, no exclusiva y gratuita para mostrarlas y agregarlas en los cálculos comunitarios.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-white">4. Metadatos y Atribución</h3>
          <p>
            Los nombres, carátulas y fechas de lanzamiento de videojuegos son propiedad de sus respectivos desarrolladores y distribuidores, recopilados mediante la API pública de RAWG.
          </p>
        </section>
      </div>
    </div>
  );
}
