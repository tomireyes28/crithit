import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendario Mensual de Estrenos',
  description: 'Consulta los lanzamientos de videojuegos mes a mes filtrando por plataforma en vista timeline o grilla.',
  openGraph: {
    title: 'Calendario Mensual de Estrenos | CritHit',
    description: 'Consulta los lanzamientos de videojuegos mes a mes filtrando por plataforma en vista timeline o grilla.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
