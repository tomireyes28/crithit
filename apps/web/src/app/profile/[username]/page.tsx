import React from 'react';
import type { Metadata } from 'next';
import { ProfileDetailClient } from './ProfileDetailClient';

interface Props {
  params: { username: string };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crithit.gg';

async function getProfile(username: string) {
  try {
    const res = await fetch(`${apiUrl}/users/profile/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfile(params.username);

  if (!profile) {
    return {
      title: 'Perfil no encontrado | CritHit',
      description: 'El perfil de usuario solicitado no existe.',
    };
  }

  const name = profile.user?.displayName || profile.user?.username || params.username;
  const criticBadge = profile.user?.criticBadge ? ` (${profile.user.criticBadge})` : '';
  const title = `${name}${criticBadge} (@${params.username})`;
  const description =
    profile.user?.bio?.slice(0, 160) ||
    `Perfil gamer de @${params.username} en CritHit. ${profile.stats?.totalReviews || 0} calificaciones y ${profile.stats?.completedGames || 0} juegos completados.`;

  const avatar = profile.user?.avatarUrl || profile.user?.bannerUrl || `${siteUrl}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `/profile/${params.username}`,
    },
    openGraph: {
      title: `${name} en CritHit`,
      description,
      url: `${siteUrl}/profile/${params.username}`,
      type: 'profile',
      images: [
        {
          url: avatar,
          width: 500,
          height: 500,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${name} (@${params.username}) | CritHit`,
      description,
      images: [avatar],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const profile = await getProfile(params.username);

  return <ProfileDetailClient username={params.username} initialProfile={profile} />;
}
