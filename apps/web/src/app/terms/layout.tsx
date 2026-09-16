import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description: 'Términos y condiciones de uso de la plataforma y servicios de CritHit.',
  openGraph: {
    title: 'Términos de Servicio | CritHit',
    description: 'Términos y condiciones de uso de la plataforma y servicios de CritHit.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
