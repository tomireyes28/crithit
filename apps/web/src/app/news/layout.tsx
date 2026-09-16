import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Noticias y Actualidad Gamer',
  description: 'Últimas noticias de la industria del videojuego, lanzamientos de hardware, anuncios y entrevistas.',
  openGraph: {
    title: 'Noticias y Actualidad Gamer | CritHit',
    description: 'Últimas noticias de la industria del videojuego, lanzamientos de hardware, anuncios y entrevistas.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
