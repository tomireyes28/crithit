import React from 'react';
import type { Metadata } from 'next';
import { ListDetailClient } from './ListDetailClient';

interface Props {
  params: { id: string };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crithit.gg';

async function getList(id: string) {
  try {
    const res = await fetch(`${apiUrl}/lists/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const list = await getList(params.id);

  if (!list) {
    return {
      title: 'Lista no encontrada | CritHit',
      description: 'La lista de videojuegos solicitada no existe o es privada.',
    };
  }

  const title = `${list.title} — por @${list.user?.username || 'usuario'}`;
  const description =
    list.description?.slice(0, 160) ||
    `Colección de ${list.entryCount || list.entries?.length || 0} videojuegos creada por ${list.user?.displayName} en CritHit.`;

  const coverImage = list.coverImageUrl || `${siteUrl}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `/lists/${params.id}`,
    },
    openGraph: {
      title: `${list.title} | CritHit`,
      description,
      url: `${siteUrl}/lists/${params.id}`,
      type: 'website',
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: list.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${list.title} | CritHit`,
      description,
      images: [coverImage],
    },
  };
}

export default async function ListDetailPage({ params }: Props) {
  const list = await getList(params.id);

  return <ListDetailClient listId={params.id} initialList={list} />;
}
