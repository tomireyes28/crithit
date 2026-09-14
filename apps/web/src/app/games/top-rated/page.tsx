'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TopRatedRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/games?sort=highest');
  }, [router]);

  return (
    <div className="py-20 text-center text-sm text-brand-muted">
      Cargando los mejores videojuegos clasificados...
    </div>
  );
}
