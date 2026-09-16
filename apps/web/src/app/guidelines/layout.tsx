import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Normas Comunitarias',
  description: 'Código de conducta y directrices de respeto y convivencia para la comunidad de CritHit.',
  openGraph: {
    title: 'Normas Comunitarias | CritHit',
    description: 'Código de conducta y directrices de respeto y convivencia para la comunidad de CritHit.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
