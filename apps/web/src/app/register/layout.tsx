import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Únete a CritHit, califica videojuegos del 0 al 100 y comparte tus experiencias con la comunidad.',
  openGraph: {
    title: 'Crear Cuenta | CritHit',
    description: 'Únete a CritHit, califica videojuegos del 0 al 100 y comparte tus experiencias con la comunidad.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
