'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Gamepad2, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { GameSummary, getScoreColorInfo } from '@crithit/shared';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';

interface GameCardProps {
  game: GameSummary;
  priority?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse position coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth physical springs for natural tilt inertia
  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 22 });

  // 3D rotation transforms (calibrated max 6° for comfortable viewing)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  // Real-time dynamic specular glare coordinates
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['15%', '85%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['15%', '85%']);

  const glareBackground = useMotionTemplate`radial-gradient(circle 220px at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 45%, transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const releaseYear =
    game.firstReleaseDate && !isNaN(new Date(game.firstReleaseDate).getTime())
      ? new Date(game.firstReleaseDate).getFullYear()
      : null;

  const displayScore =
    game.communityScore !== null && game.communityScore !== undefined
      ? game.communityScore
      : game.criticScore !== null && game.criticScore !== undefined
        ? game.criticScore
        : game.metacriticScore;

  const scoreInfo =
    displayScore !== null && displayScore !== undefined
      ? getScoreColorInfo(displayScore)
      : null;

  const scoreColor = scoreInfo?.colorHex || '#6C5CE7';
  const isMasterpiece = displayScore !== null && displayScore !== undefined && displayScore >= 95;
  const coverSrc = !imgError && game.coverUrl ? game.coverUrl : null;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="h-full [perspective:900px]"
    >
      <motion.div
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileTap={{ scale: 0.98 }}
        className={`h-full ${isHovered ? 'will-change-transform' : ''}`}
      >
        <Link
          href={`/games/${game.slug}`}
          className="group relative flex flex-col h-full rounded-2xl glass-card-v2 border overflow-hidden transition-all duration-300"
          style={{
            borderColor: isHovered ? `${scoreColor}99` : 'rgba(255, 255, 255, 0.08)',
            boxShadow: isHovered
              ? `0 16px 40px -10px ${scoreColor}45, 0 0 20px -2px ${scoreColor}25`
              : '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Dynamic Light Glare Specular Reflection */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.3 : 0,
              background: glareBackground,
            }}
          />

          {/* Holographic Prismatic Foil Reflection for Masterpiece titles */}
          {isMasterpiece && (
            <div
              className="absolute inset-0 pointer-events-none z-20 mix-blend-color-dodge transition-opacity duration-500"
              style={{
                opacity: isHovered ? 0.35 : 0,
                background:
                  'linear-gradient(115deg, transparent 20%, rgba(0,210,255,0.3) 40%, rgba(168,85,247,0.3) 60%, rgba(245,158,11,0.2) 80%, transparent 95%)',
              }}
            />
          )}

          {/* Contenedor de Carátula con Proporción Póster */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-surface">
            {coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverSrc}
                alt={game.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-brand-surface to-brand-card">
                <Gamepad2 className="w-12 h-12 text-brand-muted/40 mb-2 group-hover:text-brand-secondary/60 transition-colors" />
                <span className="text-xs font-medium text-brand-muted/60 line-clamp-2 px-2">
                  {game.name}
                </span>
              </div>
            )}

            {/* Gradiente de sombra inferior para legibilidad cinematográfica */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-black/20 to-black/35 pointer-events-none opacity-80" />

            {/* Badge de Puntuación (0-100) Flotante */}
            <div className="absolute top-2.5 right-2.5 drop-shadow-md z-10">
              <ScoreBadge score={displayScore} size="sm" animate={true} />
            </div>

            {/* Año de Lanzamiento */}
            {releaseYear && (
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
                <Calendar className="w-3 h-3 text-brand-muted" />
                <span>{releaseYear}</span>
              </div>
            )}

            {/* Quick Action Pill en Hover (Desliza suavemente desde abajo) */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
              <span className="text-[10px] font-bold text-white bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-secondary" />
                Ver Ficha
              </span>
              <span className="w-5 h-5 rounded-full bg-brand-primary/80 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Información del Videojuego */}
          <div className="p-3.5 flex flex-col flex-grow justify-between gap-2.5 relative z-10 bg-brand-card/50 backdrop-blur-sm">
            <div>
              <h3
                className="font-bold text-sm text-white line-clamp-2 group-hover:text-brand-secondary transition-colors duration-200 leading-snug"
                title={game.name}
              >
                {game.name}
              </h3>

              {/* Géneros principales */}
              {game.genres && game.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {game.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="text-[10px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-brand-surface text-brand-muted border border-brand-border/40"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Chips de plataformas compactas */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono border-t border-brand-border/40 pt-2">
                <span className="text-brand-muted/70 text-[10px] uppercase">Plat:</span>
                <div className="flex flex-wrap gap-1 truncate">
                  {game.platforms.slice(0, 3).map((plat) => (
                    <span
                      key={plat}
                      className="px-1 py-0.2 text-[10px] rounded bg-brand-primary/10 text-brand-secondary border border-brand-secondary/20"
                    >
                      {plat}
                    </span>
                  ))}
                  {game.platforms.length > 3 && (
                    <span className="text-[10px] text-brand-muted">
                      +{game.platforms.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    </div>
  );
};
