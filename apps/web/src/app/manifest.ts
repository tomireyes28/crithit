import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CritHit — Tu Diario Social de Videojuegos',
    short_name: 'CritHit',
    description:
      'Lleva registro de lo que juegas, escribe reseñas con puntuación granular de 0 a 100, obtén certificación de crítico verificado y comparte listas con la comunidad.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0E1A',
    theme_color: '#00D2FF',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['games', 'entertainment', 'social'],
  };
}
