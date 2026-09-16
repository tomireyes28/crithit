import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos personales de los usuarios de CritHit.',
  openGraph: {
    title: 'Política de Privacidad | CritHit',
    description: 'Política de privacidad y protección de datos personales de los usuarios de CritHit.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
