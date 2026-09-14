'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, Calendar, Clock, Layers, Star, Gamepad2, Bookmark } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { PLAY_STATUS_MAP, PlayStatus } from '@crithit/shared';

export interface ActivityFeedItemProps {
  item: {
    id: string;
    type: 'RATED_GAME' | 'REVIEWED_GAME' | 'LOGGED_GAME' | 'CREATED_LIST';
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      role?: string;
      criticTier?: string | null;
    };
    game?: {
      id: string;
      slug: string;
      name: string;
      coverUrl?: string | null;
      firstReleaseDate?: string | Date | null;
      communityScore?: number | null;
    };
    score?: number;
    status?: string;
    review?: {
      id: string;
      title?: string | null;
      body?: string | null;
      containsSpoilers?: boolean;
      platform?: string | null;
      playtimeAtReview?: number | null;
      likeCount?: number;
    };
    log?: {
      id: string;
      status: string;
      platform?: string | null;
      hoursPlayed?: number | null;
      notes?: string | null;
      logDate: string | Date;
    };
    list?: {
      id: string;
      title: string;
      description?: string | null;
      isRanked: boolean;
      tags?: string[];
      entryCount: number;
      likeCount: number;
      previewCovers: string[];
    };
    createdAt: string | Date;
  };
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ item }) => {
  const formattedDate = new Date(item.createdAt).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getVerb = () => {
    switch (item.type) {
      case 'REVIEWED_GAME':
        return 'escribió una reseña de';
      case 'RATED_GAME':
        return 'calificó';
      case 'LOGGED_GAME':
        return 'registró una partida de';
      case 'CREATED_LIST':
        return 'creó la lista';
      default:
        return 'realizó una acción en';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-brand-surface/70 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-accent/30 transition-all duration-200 flex flex-col gap-3.5 shadow-sm">
      {/* Header del Autor y Acción */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={`/profile/${item.user.username}`}
            className="w-8 h-8 rounded-full bg-brand-primary/30 border border-brand-primary/50 overflow-hidden relative flex-shrink-0 flex items-center justify-center font-bold text-xs text-brand-secondary hover:scale-105 transition-transform"
          >
            {item.user.avatarUrl ? (
              <Image
                src={item.user.avatarUrl}
                alt={item.user.displayName}
                fill
                className="object-cover"
              />
            ) : (
              item.user.displayName.charAt(0).toUpperCase()
            )}
          </Link>

          <div className="truncate text-xs">
            <Link
              href={`/profile/${item.user.username}`}
              className="font-bold text-white hover:text-brand-accent transition-colors inline-flex items-center gap-1"
            >
              <span>{item.user.displayName}</span>
              {item.user.criticTier && (
                <Award className="w-3 h-3 text-amber-400 flex-shrink-0" />
              )}
            </Link>
            <span className="text-brand-muted mx-1">{getVerb()}</span>
            {item.type === 'CREATED_LIST' && item.list && (
              <Link
                href={`/lists/${item.list.id}`}
                className="font-bold text-brand-accent hover:underline"
              >
                "{item.list.title}"
              </Link>
            )}
          </div>
        </div>

        <span className="text-[11px] font-mono text-brand-muted/70 flex-shrink-0">
          {formattedDate}
        </span>
      </div>

      {/* Contenido según tipo de actividad */}

      {/* TIPO: RESEÑA O CALIFICACIÓN */}
      {(item.type === 'REVIEWED_GAME' || item.type === 'RATED_GAME') && item.game && (
        <div className="flex items-start gap-4 p-3 rounded-xl bg-brand-bg/60 border border-brand-border/40">
          <Link
            href={`/games/${item.game.slug}`}
            className="w-16 sm:w-20 aspect-[3/4] rounded-lg overflow-hidden bg-brand-surface relative flex-shrink-0 shadow-md hover:scale-102 transition-transform"
          >
            {item.game.coverUrl ? (
              <Image
                src={item.game.coverUrl}
                alt={item.game.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-muted">
                🎮
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Link
                href={`/games/${item.game.slug}`}
                className="font-bold text-sm sm:text-base text-white hover:text-brand-accent transition-colors truncate"
              >
                {item.game.name}
              </Link>
              {item.score !== undefined && (
                <ScoreBadge score={item.score} size="sm" />
              )}
            </div>

            {/* Metadatos de la reseña */}
            {item.review && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-brand-muted">
                  {item.review.platform && (
                    <span className="px-1.5 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-muted font-mono">
                      {item.review.platform}
                    </span>
                  )}
                  {item.review.playtimeAtReview && (
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-brand-accent" />
                      {item.review.playtimeAtReview}h
                    </span>
                  )}
                </div>

                {item.review.title && (
                  <h4 className="text-xs font-bold text-white truncate">
                    {item.review.title}
                  </h4>
                )}

                {item.review.body && (
                  <p className="text-xs text-brand-muted line-clamp-3 leading-relaxed">
                    {item.review.containsSpoilers ? (
                      <span className="italic text-amber-400/80">
                        ⚠️ Esta reseña contiene spoilers de la trama.
                      </span>
                    ) : (
                      item.review.body
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIPO: PARTIDA EN DIARIO */}
      {item.type === 'LOGGED_GAME' && item.game && item.log && (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-brand-bg/60 border border-brand-border/40">
          <Link
            href={`/games/${item.game.slug}`}
            className="w-14 sm:w-16 aspect-[3/4] rounded-lg overflow-hidden bg-brand-surface relative flex-shrink-0 shadow-md hover:scale-102 transition-transform"
          >
            {item.game.coverUrl ? (
              <Image
                src={item.game.coverUrl}
                alt={item.game.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-muted">
                🎮
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/games/${item.game.slug}`}
                className="font-bold text-sm text-white hover:text-brand-accent transition-colors truncate"
              >
                {item.game.name}
              </Link>

              {/* Status Badge */}
              {item.log.status && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex-shrink-0 ${
                    PLAY_STATUS_MAP[item.log.status as PlayStatus]?.badgeClass ||
                    'bg-brand-surface text-brand-muted'
                  }`}
                >
                  {PLAY_STATUS_MAP[item.log.status as PlayStatus]?.labelEs ||
                    item.log.status}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-brand-muted mt-1 font-mono">
              {item.log.platform && <span>🕹️ {item.log.platform}</span>}
              {item.log.hoursPlayed ? (
                <span>⏱️ {item.log.hoursPlayed}h jugadas</span>
              ) : null}
            </div>

            {item.log.notes && (
              <p className="text-xs text-brand-text/80 italic mt-1.5 bg-brand-surface/50 p-2 rounded-lg border border-brand-border/40 line-clamp-2">
                "{item.log.notes}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* TIPO: LISTA CREADA */}
      {item.type === 'CREATED_LIST' && item.list && (
        <Link
          href={`/lists/${item.list.id}`}
          className="group/list p-3 rounded-xl bg-brand-bg/60 border border-brand-border/40 hover:border-brand-accent/40 transition-all flex items-center gap-4"
        >
          {/* Collage 2x2 Thumbnail */}
          <div className="w-20 aspect-[16/10] rounded-lg overflow-hidden bg-brand-surface relative flex-shrink-0 border border-brand-border/60">
            {item.list.previewCovers && item.list.previewCovers.length > 0 ? (
              <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5 bg-black/40">
                {item.list.previewCovers.slice(0, 4).map((cover, idx) => (
                  <div key={idx} className="relative w-full h-full overflow-hidden">
                    <Image src={cover} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-muted">
                <Layers className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-white group-hover/list:text-brand-accent transition-colors truncate">
              {item.list.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-brand-muted mt-0.5 font-mono">
              <span>{item.list.entryCount} juegos</span>
              {item.list.isRanked && <span>• # Ranked</span>}
            </div>
            {item.list.description && (
              <p className="text-xs text-brand-muted line-clamp-1 mt-1">
                {item.list.description}
              </p>
            )}
          </div>
        </Link>
      )}
    </div>
  );
};
