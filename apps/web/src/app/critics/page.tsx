'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Award,
  ShieldCheck,
  Zap,
  Crown,
  Clock,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  BarChart3,
  Cpu,
  History,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';

interface CriticStatus {
  isCritic: boolean;
  criticTier?: 'VERIFIED' | 'EXPERT' | 'MASTER' | null;
  criticBadge?: string | null;
  criticVerifiedAt?: string | null;
  totalAttempts: number;
  bestScore?: number | null;
}

interface LeaderboardCritic {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  criticTier?: string | null;
  criticBadge?: string | null;
  reviewCount: number;
  followerCount: number;
}

export default function CriticsLandingPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<CriticStatus | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardCritic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbData] = await Promise.all([
          apiClient<LeaderboardCritic[]>('/critics/leaderboard').catch(() => []),
        ]);
        setLeaderboard(lbData || []);

        if (user) {
          const statusData = await apiClient<CriticStatus>('/critics/status').catch(() => null);
          setStatus(statusData);
        }
      } catch (err) {
        console.error('Error fetching critics overview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="relative text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-bold uppercase tracking-wider shadow-glow-primary/20">
            <Award className="w-4 h-4" />
            Programa Oficial de Acreditación
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            La Crítica de Videojuegos con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-emerald-300 to-brand-secondary">
              Criterio Real
            </span>
          </h1>

          <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
            En CritHit creemos que evaluar videojuegos requiere cultura histórica, entendimiento del diseño lúdico y rigor técnico. Demuestra tu conocimiento, aprueba el examen y tus reseñas tendrán peso oficial en las fichas comunitarias.
          </p>

          {/* CTA según estado del usuario */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {status?.isCritic ? (
              <div className="p-4 rounded-2xl bg-brand-surface/90 border border-brand-primary/40 flex items-center gap-4 shadow-xl">
                <div className="p-3 rounded-xl bg-brand-primary/20 text-brand-primary">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <span className="text-xs text-brand-muted uppercase font-bold tracking-wider">
                    Estado Actual
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">
                      {status.criticBadge || 'Crítico Acreditado'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Rango {status.criticTier}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-0.5">
                    Mejor puntaje: {status.bestScore ?? 100}% ({status.totalAttempts} intentos)
                  </p>
                </div>

                <Link
                  href="/critics/exam"
                  className="ml-auto px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-bold text-white transition-colors"
                >
                  Volver a rendir
                </Link>
              </div>
            ) : user ? (
              <Link
                href="/critics/exam"
                className="px-8 py-4 rounded-2xl bg-brand-primary hover:bg-brand-secondary text-brand-bg font-extrabold text-base shadow-xl shadow-brand-primary/25 hover:shadow-brand-secondary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5"
              >
                Comenzar Examen de Acreditación
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl bg-brand-primary hover:bg-brand-secondary text-brand-bg font-extrabold text-base shadow-xl shadow-brand-primary/25 hover:shadow-brand-secondary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5"
              >
                Inicia Sesión para Acreditarte
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Los 3 Rangos de Crítica */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Los Tres Rangos de Acreditación
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              Distinguiendo la experiencia y maestría analítica en la plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rango 1: Verified Critic */}
            <div className="p-6 rounded-3xl bg-brand-surface/70 border border-brand-border/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Aprobación ≥ 75%
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">Verified Critic</h3>
                </div>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  Para quienes dominan los fundamentos del medio, narrativa y mecánicas. Tus reseñas se contabilizan en la puntuación oficial de la crítica (`criticScore`) y obtienes la insignia verde esmeralda.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-brand-border/40 text-xs text-brand-muted flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Voto computado en fichas de juegos
              </div>
            </div>

            {/* Rango 2: Expert Critic */}
            <div className="p-6 rounded-3xl bg-brand-surface/80 border border-brand-secondary/40 hover:border-brand-secondary transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-brand-secondary text-brand-bg text-[10px] font-black uppercase tracking-wider rounded-bl-xl">
                Recomendado
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-secondary/20 border border-brand-secondary/30 flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest bg-brand-secondary/10 px-2 py-0.5 rounded border border-brand-secondary/20">
                    Aprobación ≥ 90%
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">Expert Critic</h3>
                </div>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  Para analistas de élite con profundo conocimiento técnico, análisis de frametimes y perspectiva histórica. Insignia violeta neón y máxima visibilidad en el feed de actividad global.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-brand-border/40 text-xs text-brand-muted flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-brand-secondary" />
                Prioridad en reseñas destacadas
              </div>
            </div>

            {/* Rango 3: Master Critic */}
            <div className="p-6 rounded-3xl bg-brand-surface/70 border border-brand-border/80 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Consejo Editorial
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">Master Critic</h3>
                </div>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  Rango honorario otorgado por el consejo editorial de CritHit a veteranos del periodismo, desarrolladores consagrados y autores con trayectoria sobresaliente comprobada.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-brand-border/40 text-xs text-brand-muted flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Insignia dorada exclusiva
              </div>
            </div>
          </div>
        </div>

        {/* Las 4 Áreas de Evaluación */}
        <div className="p-8 sm:p-10 rounded-3xl bg-brand-surface/50 border border-brand-border/80 shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ¿Qué evalúa el Examen?
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              Las 20 preguntas seleccionadas al azar cubren cuatro pilares indispensables
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3 p-4 rounded-2xl bg-brand-card/70 border border-brand-border/50">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 w-fit">
                <History className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Historia & Hitos</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                El crash de 1983, la guerra de consolas, la transición del 2D al 3D, y obras que definieron géneros.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-brand-card/70 border border-brand-border/50">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Diseño & Mecánicas</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Game feel, disonancia ludonarrativa, coyote time, hitboxes, bucles de jugabilidad y diseño de niveles.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-brand-card/70 border border-brand-border/50">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 w-fit">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Técnica & Rendimiento</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Frame pacing, shader compilation, reescalado con IA (DLSS), latencia de entrada y netcode rollback.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-brand-card/70 border border-brand-border/50">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 w-fit">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Ética & Metodología</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Independencia editorial, tratamiento de copias de prensa, embargos, spoilers y ponderación de micropagos.
              </p>
            </div>
          </div>
        </div>

        {/* Tabla de Críticos Destacados */}
        {leaderboard.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Críticos Acreditados Destacados
                </h2>
                <p className="text-xs text-brand-muted">
                  Miembros de la comunidad con acreditación oficial activa
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {leaderboard.map((critic) => (
                <Link
                  key={critic.id}
                  href={`/profile/${critic.username}`}
                  className="p-4 rounded-2xl bg-brand-surface/60 hover:bg-brand-surface border border-brand-border/70 hover:border-brand-primary/50 transition-all flex items-center gap-3.5 group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/20 border border-brand-primary/40 overflow-hidden relative flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">
                    {critic.avatarUrl ? (
                      <Image
                        src={critic.avatarUrl}
                        alt={critic.displayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      critic.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white truncate group-hover:text-brand-primary transition-colors">
                        {critic.displayName || critic.username}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30 inline-block mt-0.5">
                      {critic.criticBadge || critic.criticTier || 'Critic'}
                    </span>

                    <div className="flex items-center gap-3 text-[11px] text-brand-muted mt-1">
                      <span>{critic.reviewCount} reseñas</span>
                      <span>•</span>
                      <span>{critic.followerCount} seguidores</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
