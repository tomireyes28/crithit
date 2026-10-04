import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Importar Biblioteca | CritHit',
  description:
    'Sincroniza y migra tu biblioteca y horas de juego desde Steam, Backloggd o Letterboxd a CritHit en segundos.',
};

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
