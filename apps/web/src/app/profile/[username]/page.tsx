'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { FavoriteFour } from '@/components/profile/FavoriteFour';
import { ScoreHistogram } from '@/components/profile/ScoreHistogram';
import { FavoriteSelectorModal } from '@/components/profile/FavoriteSelectorModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ListCard } from '@/components/lists/ListCard';
import { PLAY_STATUS_MAP, PlayStatus } from '@crithit/shared';

interface ProfileData {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    role: string;
    criticTier: string | null;
    criticBadge: string | null;
    createdAt: string;
  };
  favoriteGames: Array<{
    id: string;
    position: number;
    game: {
      id: string;
      name: string;
      slug: string;
      coverUrl: string | null;
      communityScore: number | null;
      firstReleaseDate: string | null;
    };
  }>;
  stats: {
    totalReviews: number;
    totalLoggedPlays: number;
    totalHoursPlayed: number;
    completedGames: number;
    averageScore: number | null;
    followersCount: number;
    followingCount: number;
    scoreDistribution: Array<{
      range: string;
      min: number;
      max: number;
      count: number;
    }>;
  };
  recentReviews: Array<{
    id: string;
    score: number;
    title: string | null;
    content: string | null;
    hasSpoilers: boolean;
    playedHours: number | null;
    createdAt: string;
    game: {
      id: string;
      name: string;
      slug: string;
      coverUrl: string | null;
      communityScore: number | null;
      firstReleaseDate: string | null;
    };
  }>;
  recentPlays: Array<{
    id: string;
    status: PlayStatus;
    hoursPlayed: number | null;
    logDate: string;
    platform: string | null;
    notes: string | null;
    game: {
      id: string;
      name: string;
      slug: string;
      coverUrl: string | null;
      communityScore: number | null;
      firstReleaseDate: string | null;
    };
  }>;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reviews' | 'diary' | 'lists'>('reviews');
  const [userLists, setUserLists] = useState<any[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const isOwner =
    Boolean(currentUser) &&
    currentUser?.username?.toLowerCase() === username?.toLowerCase();

  const fetchProfile = useCallback(async () => {
    if (!username) return;
    try {
      const data = await apiClient<ProfileData>(`/users/${username}`);
      setProfile(data);
    } catch (err: any) {
      setError(
        err.statusCode === 404
          ? `El usuario @${username} no existe`
          : 'Error al cargar el perfil de usuario',
      );
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (activeTab === 'lists' && username) {
      setIsLoadingLists(true);
      apiClient(`/lists/user/${username}`)
        .then((data: any) => setUserLists(data || []))
        .catch(() => setUserLists([]))
        .finally(() => setIsLoadingLists(false));
    }
  }, [activeTab, username]);

  const handleFavoritesSaved = (updatedFavorites: any[]) => {
    if (profile) {
      setProfile({
        ...profile,
        favoriteGames: updatedFavorites,
      });
    }
    fetchProfile();
  };

  const handleProfileSaved = (updatedUserData: any) => {
    if (profile) {
      setProfile({
        ...profile,
        user: {
          ...profile.user,
          ...updatedUserData,
        },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return '';
    }
  };

  const formatJoinDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg pb-20 animate-pulse">
        <div className="h-64 bg-brand-surface/40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-3xl bg-brand-surface border-4 border-brand-bg" />
            <div className="space-y-2">
              <div className="w-48 h-8 rounded-lg bg-brand-surface" />
              <div className="w-32 h-4 rounded-md bg-brand-surface" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 h-48 rounded-2xl bg-brand-surface/30" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-brand-bg">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-4xl mb-4">
          👤
        </div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          {error || 'Perfil no encontrado'}
        </h1>
        <p className="text-sm text-brand-muted mb-6">
          No pudimos encontrar ningún perfil registrado con el nombre de usuario @{username}.
        </p>
        <Link
          href="/games"
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-accent text-brand-bg hover:brightness-110 transition-all shadow"
        >
          ← Volver a Explorar Juegos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-24">
      {/* Banner de Perfil */}
      <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-brand-surface/50">
        {profile.user.bannerUrl ? (
          <img
            src={profile.user.bannerUrl}
            alt="Profile banner"
            className="w-full h-full object-cover filter brightness-[0.6]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-brand-primary/30 via-brand-surface to-brand-secondary/30 opacity-75" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-10">
        {/* Cabecera del Perfil: Avatar + Info + Botones */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-brand-border/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-brand-card border-4 border-brand-bg shadow-2xl flex items-center justify-center text-4xl font-black text-white flex-shrink-0">
              {profile.user.avatarUrl ? (
                <img
                  src={profile.user.avatarUrl}
                  alt={profile.user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{profile.user.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Nombres y Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-brand-text">
                  {profile.user.displayName}
                </h1>
                {profile.user.criticTier && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-violet-500/20 border border-violet-500/40 text-violet-300">
                    {profile.user.criticBadge || 'Crítico Acreditado'}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-muted font-mono mb-2">
                @{profile.user.username}
              </p>

              {/* Bio */}
              {profile.user.bio && (
                <p className="text-xs sm:text-sm text-brand-text/90 max-w-xl mb-3 leading-relaxed">
                  {profile.user.bio}
                </p>
              )}

              {/* Metadatos (Ubicación, Web, Miembro desde) */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                {profile.user.location && (
                  <span className="flex items-center gap-1">
                    <span>📍</span> {profile.user.location}
                  </span>
                )}
                {profile.user.website && (
                  <a
                    href={profile.user.website.startsWith('http') ? profile.user.website : `https://${profile.user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-accent hover:underline"
                  >
                    <span>🔗</span> Enlace personal
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <span>📅</span> Miembro desde {formatJoinDate(profile.user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de Editar Perfil */}
          {isOwner && (
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-surface hover:bg-brand-border/60 border border-brand-border text-brand-text transition-colors flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span>Editar Perfil</span>
            </button>
          )}
        </div>

        {/* Barra de Estadísticas de Juego */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-brand-surface/40 border border-brand-border/60 text-center">
            <span className="block font-mono font-black text-2xl text-brand-accent">
              {profile.stats.totalReviews}
            </span>
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
              Calificaciones
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-brand-surface/40 border border-brand-border/60 text-center">
            <span className="block font-mono font-black text-2xl text-blue-400">
              {profile.stats.totalLoggedPlays}
            </span>
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
              En Diario
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-brand-surface/40 border border-brand-border/60 text-center">
            <span className="block font-mono font-black text-2xl text-emerald-400">
              {Math.round(profile.stats.totalHoursPlayed)}h
            </span>
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
              Horas Jugadas
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-brand-surface/40 border border-brand-border/60 text-center">
            <span className="block font-mono font-black text-2xl text-amber-400">
              {profile.stats.completedGames}
            </span>
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
              Completados
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-brand-surface/40 border border-brand-border/60 text-center flex flex-col items-center justify-center">
            <div className="mb-0.5">
              <ScoreBadge score={profile.stats.averageScore} size="sm" />
            </div>
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider mt-1">
              Nota Media
            </span>
          </div>
        </div>

        {/* Vitrina Favorite Four */}
        <section>
          <FavoriteFour
            favorites={profile.favoriteGames}
            isOwner={isOwner}
            onEditFavorites={() => setIsFavoritesModalOpen(true)}
          />
        </section>

        {/* Histograma de Criterio de Calificación (0-100) */}
        <section>
          <ScoreHistogram
            distribution={profile.stats.scoreDistribution}
            averageScore={profile.stats.averageScore}
            totalReviews={profile.stats.totalReviews}
          />
        </section>

        {/* Pestañas de Actividad: Reseñas & Diario */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-brand-border/60 pb-2">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-bold pb-2 transition-all relative ${
                activeTab === 'reviews'
                  ? 'text-brand-text'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <span>Reseñas Recientes</span>
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-accent rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('diary')}
              className={`text-sm font-bold pb-2 transition-all relative ${
                activeTab === 'diary'
                  ? 'text-brand-text'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <span>Partidas en Diario</span>
              {activeTab === 'diary' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-accent rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('lists')}
              className={`text-sm font-bold pb-2 transition-all relative ${
                activeTab === 'lists'
                  ? 'text-brand-text'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <span>Listas</span>
              {activeTab === 'lists' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-accent rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'reviews' ? (
            profile.recentReviews.length === 0 ? (
              <p className="text-xs text-brand-muted py-6 text-center">
                Este usuario aún no ha publicado reseñas.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-brand-surface/40 border border-brand-border/60 flex items-start gap-4"
                  >
                    <Link
                      href={`/games/${rev.game.slug}`}
                      className="w-16 aspect-[3/4] rounded-xl overflow-hidden bg-brand-surface border border-brand-border/60 flex-shrink-0"
                    >
                      {rev.game.coverUrl && (
                        <img
                          src={rev.game.coverUrl}
                          alt={rev.game.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Link
                          href={`/games/${rev.game.slug}`}
                          className="text-sm font-bold text-brand-text hover:text-brand-accent transition-colors truncate"
                        >
                          {rev.game.name}
                        </Link>
                        <ScoreBadge score={rev.score} size="sm" />
                      </div>

                      <span className="text-[11px] text-brand-muted block mb-2">
                        {formatDate(rev.createdAt)}
                        {rev.playedHours ? ` · ${rev.playedHours}h` : ''}
                      </span>

                      {rev.title && (
                        <h4 className="text-xs font-bold text-brand-text mb-1 truncate">
                          {rev.title}
                        </h4>
                      )}

                      {rev.content && (
                        <p className="text-xs text-brand-muted line-clamp-2">
                          {rev.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'diary' ? (
            profile.recentPlays.length === 0 ? (
              <p className="text-xs text-brand-muted py-6 text-center">
                No hay partidas registradas recientemente en el diario.
              </p>
            ) : (
              <div className="space-y-3">
                {profile.recentPlays.map((p) => {
                  const statusInfo = PLAY_STATUS_MAP[p.status];
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-brand-surface/40 border border-brand-border/60 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Link
                          href={`/games/${p.game.slug}`}
                          className="w-10 h-14 rounded-lg overflow-hidden bg-brand-surface border border-brand-border flex-shrink-0"
                        >
                          {p.game.coverUrl && (
                            <img
                              src={p.game.coverUrl}
                              alt={p.game.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </Link>

                        <div className="min-w-0">
                          <Link
                            href={`/games/${p.game.slug}`}
                            className="text-sm font-bold text-brand-text hover:text-brand-accent transition-colors truncate block"
                          >
                            {p.game.name}
                          </Link>
                          <span className="text-[11px] text-brand-muted">
                            {formatDate(p.logDate)}
                            {p.platform ? ` · ${p.platform}` : ''}
                            {p.hoursPlayed ? ` · ⏱️ ${p.hoursPlayed}h` : ''}
                          </span>
                        </div>
                      </div>

                      {statusInfo && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex-shrink-0 ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.labelEs}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : isLoadingLists ? (
            <div className="py-12 text-center text-xs text-brand-muted">Cargando listas...</div>
          ) : userLists.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-muted">
              {isOwner
                ? 'Aún no has creado ninguna lista. ¡Crea tu primera lista desde la sección Listas!'
                : 'Este usuario aún no tiene listas públicas.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modales */}
      {isOwner && (
        <>
          <FavoriteSelectorModal
            isOpen={isFavoritesModalOpen}
            onClose={() => setIsFavoritesModalOpen(false)}
            initialFavorites={profile.favoriteGames}
            onFavoritesSaved={handleFavoritesSaved}
          />
          <EditProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={() => setIsEditProfileModalOpen(false)}
            user={profile.user}
            onProfileSaved={handleProfileSaved}
          />
        </>
      )}
    </div>
  );
}
