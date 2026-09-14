import React from 'react';
import Link from 'next/link';
import { Gamepad2, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-brand-card/70 border-t border-brand-border/60 text-brand-muted text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Crit<span className="text-brand-secondary">Hit</span>
              </span>
            </Link>
            <p className="text-xs text-brand-muted leading-relaxed">
              La plataforma social definitiva para registrar, puntuar (0 a 100) y descubrir videojuegos.
              Inspirada en el amor por el gaming y la crítica constructiva.
            </p>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Explorar</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/games" className="hover:text-white transition-colors">
                  Todos los Juegos
                </Link>
              </li>
              <li>
                <Link href="/games/top-rated" className="hover:text-white transition-colors">
                  Mejor Puntuados (Top 100)
                </Link>
              </li>
              <li>
                <Link href="/games/upcoming" className="hover:text-white transition-colors">
                  Próximos Estrenos
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  Noticias & Actualizaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Comunidad</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Reseñas Recientes
                </Link>
              </li>
              <li>
                <Link href="/lists" className="hover:text-white transition-colors">
                  Listas de la Comunidad
                </Link>
              </li>
              <li>
                <Link href="/critics/exam" className="hover:text-white transition-colors">
                  Certificación de Críticos
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Reconocimientos */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Atribución</h4>
            <p className="text-xs text-brand-muted leading-relaxed">
              Metadatos e imágenes proporcionados por{' '}
              <a
                href="https://rawg.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-secondary hover:underline font-medium"
              >
                RAWG Video Games Database
              </a>
              .
            </p>
            <div className="mt-4 text-xs flex items-center gap-1 text-brand-muted">
              Hecho con <Heart className="w-3.5 h-3.5 text-brand-tertiary inline fill-brand-tertiary" /> para gamers.
            </div>
          </div>
        </div>

        <div className="border-t border-brand-border/40 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <p>© {new Date().getFullYear()} CritHit. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="/guidelines" className="hover:text-white transition-colors">
              Pautas de Reseñas
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
