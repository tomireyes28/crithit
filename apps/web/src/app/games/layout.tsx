import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorar Catálogo de Videojuegos',
  description: 'Explora más de 500.000 videojuegos, filtra por género, plataforma y descubre las mejores puntuaciones del 0 al 100.',
  openGraph: {
    title: 'Explorar Catálogo de Videojuegos | CritHit',
    description: 'Explora más de 500.000 videojuegos, filtra por género, plataforma y descubre las mejores puntuaciones del 0 al 100.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
