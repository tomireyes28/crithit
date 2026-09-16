import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Listas y Colecciones de Videojuegos',
  description: 'Descubre y crea colecciones temáticas de videojuegos: tops históricos, sagas completas y recomendaciones.',
  openGraph: {
    title: 'Listas y Colecciones de Videojuegos | CritHit',
    description: 'Descubre y crea colecciones temáticas de videojuegos: tops históricos, sagas completas y recomendaciones.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
