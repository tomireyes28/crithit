import React from 'react';
import type { Metadata } from 'next';
import { GameDetailClient } from './GameDetailClient';

interface Props {
  params: { slug: string };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crithit.gg';

async function getGame(slug: string) {
  try {
    const res = await fetch(`${apiUrl}/games/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = await getGame(params.slug);

  if (!game) {
    return {
      title: 'Juego no encontrado | CritHit',
      description: 'El videojuego solicitado no fue encontrado en CritHit.',
    };
  }

  const scoreText = game.communityScore ? ` (Puntuación: ${game.communityScore}/100)` : '';
  const title = `${game.name}${scoreText}`;
  const description =
    game.summary?.slice(0, 160) ||
    `Descubre opiniones, calificaciones de 0 a 100 y seguimiento en diario para ${game.name} en CritHit.`;

  const ogImage = game.backdropUrl || game.coverUrl || `${siteUrl}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `/games/${params.slug}`,
    },
    openGraph: {
      title: `${game.name} | CritHit`,
      description,
      url: `${siteUrl}/games/${params.slug}`,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: game.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${game.name} | CritHit`,
      description,
      images: [ogImage],
    },
  };
}

export default async function GameDetailPage({ params }: Props) {
  const game = await getGame(params.slug);

  const jsonLd = game
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: game.name,
        description: game.summary || undefined,
        image: game.coverUrl || game.backdropUrl || undefined,
        genre: game.genres?.map((g: any) => g.name) || [],
        gamePlatform: game.platforms?.map((p: any) => p.name) || [],
        ...(game.communityScore && game.communityCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: game.communityScore,
                bestRating: 100,
                worstRating: 0,
                ratingCount: game.communityCount,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <GameDetailClient slug={params.slug} initialGame={game} />
    </>
  );
}
