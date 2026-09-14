'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UpcomingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/calendar');
  }, [router]);

  return (
    <div className="py-20 text-center text-sm text-brand-muted">
      Redirigiendo al Calendario de Estrenos...
    </div>
  );
}
