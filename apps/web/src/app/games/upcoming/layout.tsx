import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Próximos Lanzamientos y Estrenos',
  description: 'Descubre los videojuegos más esperados que se lanzarán próximamente en PC, PS5, Xbox y Switch.',
  openGraph: {
    title: 'Próximos Lanzamientos y Estrenos | CritHit',
    description: 'Descubre los videojuegos más esperados que se lanzarán próximamente en PC, PS5, Xbox y Switch.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
