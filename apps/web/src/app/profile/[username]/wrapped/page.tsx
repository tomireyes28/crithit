'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import {
  Sparkles,
  Award,
  Clock,
  Gamepad2,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Flame,
  X,
  Layers,
  ArrowRight,
  Check,
  RotateCcw,
} from 'lucide-react';

interface WrappedData {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  criticTier: string | null;
  year: number;
  totalGamesPlayed: number;
  totalHoursPlayed: number;
  totalReviewsWritten: number;
  averageScoreGiven: number;
  goty: {
    id: string;
    slug: string;
    name: string;
    coverUrl: string;
    score: number;
    hours: number;
  } | null;
  topGenres: Array<{ name: string; count: number; percentage: number }>;
  topPlatforms: Array<{ name: string; count: number; percentage: number }>;
  gamerPersona: {
    title: string;
    description: string;
    badgeEmoji: string;
  };
  monthlyActivity: Array<{ month: string; hours: number; gamesCount: number }>;
  highlights: {
    longestGame: { name: string; hours: number; coverUrl: string } | null;
    highestRated: { name: string; score: number; coverUrl: string } | null;
    favoriteReleaseYear: number;
  };
}

export default function UserWrappedPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const TOTAL_SLIDES = 5;

  useEffect(() => {
    async function fetchWrapped() {
      try {
        setLoading(true);
        const res: any = await apiClient(`/users/${username}/wrapped?year=2024`);
        setData(res);
      } catch (err) {
        console.error('Error fetching wrapped:', err);
      } finally {
        setLoading(false);
      }
    }
    if (username) fetchWrapped();
  }, [username]);

  // Temporizador automático estilo Stories
  useEffect(() => {
    if (loading || isPaused || currentSlide >= TOTAL_SLIDES - 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : prev));
    }, 6500);

    return () => clearInterval(interval);
  }, [loading, isPaused, currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(TOTAL_SLIDES - 1, prev + 1));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  // Generador de imagen en Canvas descargable en PNG
  const handleDownloadCard = () => {
    if (!data) return;
    setDownloading(true);

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo degradado
    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, '#0a0d14');
    grad.addColorStop(0.5, '#121726');
    grad.addColorStop(1, '#05070a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Glow ambiental
    const radialGrad = ctx.createRadialGradient(540, 400, 100, 540, 400, 600);
    radialGrad.addColorStop(0, 'rgba(108, 92, 231, 0.35)');
    radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Cabecera CritHit
    ctx.fillStyle = '#00D2FF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('CRITHIT WRAPPED 2024', 80, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(data.displayName || data.username, 80, 190);

    ctx.fillStyle = '#A0AEC0';
    ctx.font = '30px monospace';
    ctx.fillText(`@${data.username} • Resumen Anual`, 80, 240);

    // Arquetipo de Gamer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.roundRect(80, 290, 920, 180, 24);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(`${data.gamerPersona.badgeEmoji} ${data.gamerPersona.title}`, 120, 360);

    ctx.fillStyle = '#CBD5E0';
    ctx.font = '26px sans-serif';
    ctx.fillText(data.gamerPersona.description.slice(0, 65) + '...', 120, 415);

    // Métricas en 3 cajas
    const drawStatBox = (x: number, y: number, w: number, h: number, val: string, label: string) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.roundRect(x, y, w, h, 20);
      ctx.fill();

      ctx.fillStyle = '#00D2FF';
      ctx.font = 'bold 56px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + w / 2, y + 80);

      ctx.fillStyle = '#A0AEC0';
      ctx.font = '24px sans-serif';
      ctx.fillText(label, x + w / 2, y + 130);
      ctx.textAlign = 'left';
    };

    drawStatBox(80, 510, 280, 170, `${data.totalHoursPlayed}h`, 'Horas Jugadas');
    drawStatBox(400, 510, 280, 170, `${data.totalGamesPlayed}`, 'Juegos Registrados');
    drawStatBox(720, 510, 280, 170, `${data.averageScoreGiven}`, 'Nota Promedio');

    // GOTY
    if (data.goty) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
      ctx.roundRect(80, 720, 920, 320, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('👑 JUEGO DEL AÑO PERSONAL (GOTY)', 120, 780);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(data.goty.name, 120, 850);

      ctx.fillStyle = '#CBD5E0';
      ctx.font = '30px sans-serif';
      ctx.fillText(`Puntuación: ${data.goty.score}/100 • ${data.goty.hours} horas dedicadas`, 120, 920);
    }

    // Top Géneros
    ctx.fillStyle = '#A0AEC0';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('GÉNEROS FAVORITOS:', 80, 1100);

    data.topGenres.slice(0, 3).forEach((g, i) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.roundRect(80 + i * 310, 1130, 290, 80, 16);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(g.name.slice(0, 16), 100 + i * 310, 1180);
    });

    // Pie de marca
    ctx.fillStyle = '#718096';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('crithit.gg • Tu diario y comunidad de videojuegos', 80, 1280);

    // Exportar a descarga
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `crithit-wrapped-2024-${data.username}.png`;
    a.click();
    setDownloading(false);
  };

  const handleShareTwitter = () => {
    if (!data) return;
    const text = encodeURIComponent(
      `¡Mi 2024 en videojuegos según CritHit Wrapped! 🎮✨\n\n` +
      `⏱️ ${data.totalHoursPlayed} horas jugadas\n` +
      `🏆 GOTY: ${data.goty?.name || 'Varios títulos'}\n` +
      `🎖️ Arquetipo: ${data.gamerPersona.title}\n\n` +
      `Descubre tu año gamer en @CritHit:`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-bold text-brand-muted">Generando tu CritHit Wrapped 2024...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center p-6 text-white space-y-4">
        <p className="text-lg font-bold">No se pudo cargar el resumen anual de este usuario.</p>
        <Link
          href={`/profile/${username}`}
          className="px-5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-bold hover:text-brand-secondary transition-colors"
        >
          Volver al Perfil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Fondo dinámico reactivo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Botón flotante para salir */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => router.push(`/profile/${username}`)}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contenedor tipo Pantalla de Smartphone / Stories */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full max-w-md h-[740px] rounded-3xl bg-gradient-to-b from-[#131826] via-[#0c101c] to-[#080a12] border border-white/15 shadow-2xl overflow-hidden flex flex-col justify-between p-6 sm:p-8"
      >
        {/* Barra superior de segmentos de progreso */}
        <div className="grid grid-cols-5 gap-1.5 z-20">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
            <div
              key={idx}
              className="h-1 rounded-full overflow-hidden bg-white/20"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx < currentSlide
                    ? 'w-full bg-white'
                    : idx === currentSlide
                      ? 'w-full bg-amber-400'
                      : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Contenido Dinámico de las Slides */}
        <div className="flex-1 flex flex-col justify-center py-6 z-10">
          <AnimatePresence mode="wait">
            {/* SLIDE 0: BIENVENIDA & MÉTRICAS */}
            {currentSlide === 0 && (
              <motion.div
                key="slide-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-3xl mx-auto overflow-hidden bg-gradient-to-tr from-amber-400 to-purple-500 p-0.5 shadow-glow-primary">
                  <div className="w-full h-full rounded-3xl bg-brand-surface overflow-hidden flex items-center justify-center font-black text-2xl">
                    {data.avatarUrl ? (
                      <img src={data.avatarUrl} alt={data.username} className="w-full h-full object-cover" />
                    ) : (
                      data.username[0].toUpperCase()
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                    CRITHIT WRAPPED 2024
                  </span>
                  <h2 className="text-3xl font-black tracking-tight text-white pt-2">
                    {data.displayName}
                  </h2>
                  <p className="text-xs font-mono text-zinc-400">@{data.username}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="block font-mono font-black text-3xl text-amber-400">
                      {data.totalHoursPlayed}h
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Horas Jugadas
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="block font-mono font-black text-3xl text-cyan-400">
                      {data.totalGamesPlayed}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Juegos Jugados
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="block font-mono font-black text-3xl text-purple-400">
                      {data.totalReviewsWritten}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Reseñas Escritas
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="block font-mono font-black text-3xl text-emerald-400">
                      {data.averageScoreGiven}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Nota Promedio
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 1: GOTY PERSONAL */}
            {currentSlide === 1 && (
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5 text-center"
              >
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>TU JUEGO DEL AÑO (GOTY)</span>
                  </span>
                  <h3 className="text-2xl font-black text-white pt-2">
                    La joya indiscutible de tu 2024
                  </h3>
                </div>

                {data.goty && (
                  <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-500/15 via-white/5 to-white/5 border border-amber-500/40 relative space-y-4 shadow-[0_0_35px_rgba(245,158,11,0.2)]">
                    <div className="w-36 aspect-[3/4] mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/60 relative">
                      <img src={data.goty.coverUrl} alt={data.goty.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 drop-shadow-lg">
                        <ScoreBadge score={data.goty.score} size="md" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-white">{data.goty.name}</h4>
                      <p className="text-xs text-amber-300 font-mono">
                        {data.goty.hours} horas dedicadas • Calificación: {data.goty.score}/100
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SLIDE 2: GÉNEROS Y PLATAFORMAS */}
            {currentSlide === 2 && (
              <motion.div
                key="slide-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-400/20 text-purple-300 border border-purple-400/40">
                    PREFERENCIAS GAMER
                  </span>
                  <h3 className="text-2xl font-black text-white pt-2">
                    Tus mundos predilectos
                  </h3>
                </div>

                {/* Top Géneros */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Géneros Más Jugados
                  </h4>
                  {data.topGenres.map((g, idx) => (
                    <div key={g.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{idx + 1}. {g.name}</span>
                        <span className="text-amber-400 font-mono">{g.percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full"
                          style={{ width: `${g.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top Plataformas */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Plataformas Principales
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.topPlatforms.map((p) => (
                      <span
                        key={p.name}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-cyan-300"
                      >
                        {p.name} ({p.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 3: ARQUETIPO (GAMER PERSONA) */}
            {currentSlide === 3 && (
              <motion.div
                key="slide-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                    ARQUETIPO CRITHIT
                  </span>
                  <h3 className="text-2xl font-black text-white pt-2">
                    Tu personalidad de juego
                  </h3>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-500/20 via-white/5 to-white/5 border border-purple-500/40 relative space-y-4">
                  <div className="w-24 h-24 rounded-3xl mx-auto bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                    {data.gamerPersona.badgeEmoji}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-white">
                      {data.gamerPersona.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed px-2">
                      {data.gamerPersona.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 4: TARJETA FINAL PARA REDES SOCIALES */}
            {currentSlide === 4 && (
              <motion.div
                key="slide-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5 text-center"
              >
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                    ¡LISTO PARA COMPARTIR!
                  </span>
                  <h3 className="text-2xl font-black text-white pt-2">
                    Presume tu año gamer
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-white">Resumen 2024 de {data.displayName}</span>
                    <span className="text-[10px] font-mono text-amber-400">crithit.gg</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">GOTY:</span>
                      <strong className="text-white truncate block">{data.goty?.name}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Horas Totales:</span>
                      <strong className="text-amber-400 font-mono">{data.totalHoursPlayed}h</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Arquetipo:</span>
                      <strong className="text-purple-300">{data.gamerPersona.title}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Títulos:</span>
                      <strong className="text-cyan-300">{data.totalGamesPlayed} juegos</strong>
                    </div>
                  </div>
                </div>

                {/* Acciones de exportación */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleDownloadCard}
                    disabled={downloading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloading ? 'Generando PNG...' : 'Descargar Tarjeta en PNG (Alta Resolución)'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleShareTwitter}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Postear en X</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado' : 'Copiar Enlace'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controles de navegación inferior */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 z-20">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-20 text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-mono text-zinc-400">
            {currentSlide + 1} / {TOTAL_SLIDES}
          </span>

          <button
            onClick={handleNext}
            disabled={currentSlide === TOTAL_SLIDES - 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-20 text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
