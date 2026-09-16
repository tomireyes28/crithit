import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obras Maestras y Mejor Calificados',
  description: 'Los mejores videojuegos de todos los tiempos según la comunidad y la crítica verificada de CritHit.',
  openGraph: {
    title: 'Obras Maestras y Mejor Calificados | CritHit',
    description: 'Los mejores videojuegos de todos los tiempos según la comunidad y la crítica verificada de CritHit.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
