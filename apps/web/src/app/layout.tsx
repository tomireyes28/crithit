import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { PwaRegister } from '@/components/pwa/PwaRegister';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crithit.gg';

export const viewport: Viewport = {
  themeColor: '#0A0E1A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CritHit — Tu Diario Social de Videojuegos (Puntúa del 0 al 100)',
    template: '%s | CritHit',
  },
  description:
    'Lleva registro de lo que juegas, escribe reseñas con puntuación granular del 0 al 100, obtén certificación de crítico verificado y comparte listas con la comunidad.',
  keywords: [
    'videojuegos',
    'letterboxd de videojuegos',
    'crítica de videojuegos',
    'backloggd',
    'reseñas gaming',
    'crithit',
    'puntuación 0-100',
    'diario gamer',
    'seguimiento de partidas',
  ],
  authors: [{ name: 'CritHit' }],
  creator: 'CritHit',
  publisher: 'CritHit',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CritHit — Tu Diario Social de Videojuegos (Puntúa del 0 al 100)',
    description:
      'Lleva registro de tus partidas, califica del 0 al 100 y descubre qué juegan tus amigos en la plataforma gamer definitiva.',
    url: siteUrl,
    siteName: 'CritHit',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CritHit — Tu Diario Social de Videojuegos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CritHit — Tu Diario Social de Videojuegos',
    description:
      'Lleva registro de tus juegos, puntúa del 0 al 100 y conviértete en crítico acreditado.',
    images: ['/og-image.png'],
    creator: '@crithit',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CritHit',
    url: siteUrl,
    description:
      'Plataforma social de seguimiento, calificación de 0 a 100 y reseñas de videojuegos.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/games?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-brand-bg text-brand-text min-h-screen flex flex-col antialiased selection:bg-brand-primary selection:text-white">
        <AuthProvider>
          <PwaRegister />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
          <PwaInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}

