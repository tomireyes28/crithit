import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Actividad de la Comunidad',
  description: 'Sigue la actividad en tiempo real de tus amigos: qué juegos están jugando, sus últimas reseñas y listas.',
  openGraph: {
    title: 'Actividad de la Comunidad | CritHit',
    description: 'Sigue la actividad en tiempo real de tus amigos: qué juegos están jugando, sus últimas reseñas y listas.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
