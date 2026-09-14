'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { FadeIn } from '@/components/ui/MotionWrapper';

export default function PrivacyPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-brand-secondary/20 border border-brand-secondary/40 flex items-center justify-center text-brand-secondary">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Política de Privacidad</h1>
            <p className="text-xs text-brand-muted">Tu privacidad y datos son sagrados en CritHit</p>
          </div>
        </div>
      </FadeIn>

      <div className="glass-panel p-8 rounded-3xl border border-brand-border/60 space-y-6 text-sm text-brand-muted leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-white">1. Datos que Recopilamos</h3>
          <p>
            Recopilamos la información mínima necesaria para brindarte el servicio: tu nombre de usuario, dirección de correo electrónico cifrada con bcrypt y los registros de videojuegos que decides guardar voluntariamente en tu diario y listas.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-white">2. No Venta de Datos</h3>
          <p>
            Nunca vendemos ni comercializamos tus datos personales o hábitos de juego a empresas de publicidad de terceros. CritHit fue creado por y para la comunidad de jugadores.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-white">3. Seguridad de la Información</h3>
          <p>
            Toda la comunicación entre tu navegador y nuestros servidores viaja cifrada mediante HTTPS/TLS. Las contraseñas se almacenan con algoritmos de hashing unidireccionales seguros.
          </p>
        </section>
      </div>
    </div>
  );
}
