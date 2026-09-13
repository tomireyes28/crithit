import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CritHit — Tu Diario Social de Videojuegos (Puntúa del 0 al 100)',
  description:
    'Lleva registro de lo que juegas, escribe reseñas con puntuación granular de 0 a 100, obtén certificación de crítico verificado y comparte con amigos.',
  keywords: ['videojuegos', 'letterboxd', 'crítica de videojuegos', 'backloggd', 'reseñas gaming', 'crithit'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-brand-bg text-brand-text min-h-screen flex flex-col antialiased selection:bg-brand-primary selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
