import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feed Comunitario de Reseñas',
  description: 'Opiniones honestas, análisis profundos y calificaciones de 0 a 100 compartidas por la comunidad de CritHit.',
  openGraph: {
    title: 'Feed Comunitario de Reseñas | CritHit',
    description: 'Opiniones honestas, análisis profundos y calificaciones de 0 a 100 compartidas por la comunidad de CritHit.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
