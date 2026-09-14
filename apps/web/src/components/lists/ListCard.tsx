'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Layers, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ListCardData {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  isRanked: boolean;
  isPublic: boolean;
  tags?: string[];
  entryCount: number;
  likeCount: number;
  hasLiked?: boolean;
  previewCovers?: string[];
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    role?: string;
    criticTier?: string | null;
  };
  createdAt: string;
}

interface ListCardProps {
  list: ListCardData;
}

export const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const covers = list.previewCovers || [];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="h-full"
    >
      <div className="group bg-brand-surface/75 hover:bg-brand-surface rounded-2xl border border-brand-border/60 hover:border-brand-secondary/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-card-hover h-full justify-between">
      {/* Portada en Mosaico 2x2 / Collage */}
      <Link href={`/lists/${list.id}`} className="block relative aspect-[16/10] bg-brand-bg/80 overflow-hidden">
        {list.coverImageUrl ? (
          <Image
            src={list.coverImageUrl}
            alt={list.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : covers.length > 0 ? (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-black/40 group-hover:scale-102 transition-transform duration-300">
            {covers.slice(0, 4).map((cover, idx) => (
              <div key={idx} className="relative w-full h-full rounded-lg overflow-hidden bg-brand-surface">
                <Image
                  src={cover}
                  alt={`Cover ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
            {/* Si tiene menos de 4, rellenamos con placeholders oscuros */}
            {Array.from({ length: Math.max(0, 4 - covers.length) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="w-full h-full rounded-lg bg-brand-bg/50 border border-brand-border/30 flex items-center justify-center text-brand-muted/40"
              >
                <Layers className="w-5 h-5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-brand-bg/60 text-brand-muted/50 p-4">
            <Layers className="w-10 h-10 mb-2 stroke-1" />
            <span className="text-xs font-mono">Sin videojuegos aún</span>
          </div>
        )}

        {/* Gradiente superior/inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent opacity-60" />

        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {list.isRanked && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-brand-bg text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <span>#</span> Ranked
            </span>
          )}
          {!list.isPublic && (
            <span className="px-2 py-0.5 rounded-md bg-purple-500/80 text-white text-[10px] font-bold uppercase tracking-wider">
              Privada
            </span>
          )}
        </div>

        {/* Contador de juegos */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-mono flex items-center gap-1.5 shadow-md">
          <Layers className="w-3.5 h-3.5 text-brand-accent" />
          <span>{list.entryCount} {list.entryCount === 1 ? 'juego' : 'juegos'}</span>
        </div>
      </Link>

      {/* Contenido de la Tarjeta */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Título */}
          <Link href={`/lists/${list.id}`}>
            <h3 className="font-bold text-base sm:text-lg text-brand-text group-hover:text-brand-accent transition-colors line-clamp-1 leading-snug">
              {list.title}
            </h3>
          </Link>

          {/* Descripción opcional */}
          {list.description && (
            <p className="text-xs text-brand-muted line-clamp-2 mt-1.5 leading-relaxed">
              {list.description}
            </p>
          )}

          {/* Tags */}
          {list.tags && list.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {list.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-brand-bg text-[10px] font-medium text-brand-muted border border-brand-border/40"
                >
                  #{tag}
                </span>
              ))}
              {list.tags.length > 3 && (
                <span className="text-[10px] text-brand-muted/70 px-1 py-0.5">
                  +{list.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Creador y Likes */}
        <div className="pt-3.5 mt-3.5 border-t border-brand-border/40 flex items-center justify-between gap-2">
          <Link
            href={`/profile/${list.user.username}`}
            className="flex items-center gap-2 group/user max-w-[70%]"
          >
            <div className="w-6 h-6 rounded-full bg-brand-primary/30 border border-brand-primary/50 overflow-hidden relative flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-brand-secondary">
              {list.user.avatarUrl ? (
                <Image
                  src={list.user.avatarUrl}
                  alt={list.user.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                list.user.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-xs font-semibold text-brand-muted group-hover/user:text-white transition-colors truncate">
              {list.user.displayName}
            </span>
            {list.user.criticTier && (
              <Award className="w-3 h-3 text-amber-400 flex-shrink-0" />
            )}
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-mono text-brand-muted">
            <Heart
              className={`w-3.5 h-3.5 ${
                list.hasLiked
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-brand-muted group-hover:text-rose-400'
              } transition-colors`}
            />
            <span>{list.likeCount}</span>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};
