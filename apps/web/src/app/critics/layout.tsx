import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Programa de Críticos Acreditados',
  description: 'Conoce los estándares de acreditación de CritHit, el banco de preguntas y cómo convertirte en crítico verificado.',
  openGraph: {
    title: 'Programa de Críticos Acreditados | CritHit',
    description: 'Conoce los estándares de acreditación de CritHit, el banco de preguntas y cómo convertirte en crítico verificado.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
