import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Ingresa a tu cuenta de CritHit para continuar registrando tus partidas y reseñas.',
  openGraph: {
    title: 'Iniciar Sesión | CritHit',
    description: 'Ingresa a tu cuenta de CritHit para continuar registrando tus partidas y reseñas.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
