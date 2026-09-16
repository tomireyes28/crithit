import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Diario de Videojuegos',
  description: 'Registro personal de partidas, horas jugadas y estados de tus videojuegos en CritHit.',
  openGraph: {
    title: 'Mi Diario de Videojuegos | CritHit',
    description: 'Registro personal de partidas, horas jugadas y estados de tus videojuegos en CritHit.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
