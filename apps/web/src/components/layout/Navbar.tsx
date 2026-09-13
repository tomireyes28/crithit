'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Search, Award, Sparkles, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/85 backdrop-blur-md border-b border-brand-border/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform duration-200">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1 font-sans">
                  Crit<span className="text-brand-secondary">Hit</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-brand-primary/30 text-brand-secondary border border-brand-secondary/30 rounded-md ml-1">
                    0-100
                  </span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/games"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Juegos
              </Link>
              <Link
                href="/reviews"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Reseñas
              </Link>
              <Link
                href="/lists"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Listas
              </Link>
              <Link
                href="/news"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Noticias
              </Link>
              <Link
                href="/critics/exam"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-secondary hover:text-white hover:bg-brand-secondary/10 transition-colors flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-brand-secondary" />
                Examen Crítico
              </Link>
            </div>
          </div>

          {/* Search bar & Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Input */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Buscar juegos, usuarios..."
                className="w-full bg-brand-card/90 border border-brand-border/80 rounded-xl pl-9 pr-4 py-1.5 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
            </div>

            {/* Auth Buttons */}
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-brand-muted hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl shadow-glow-primary transition-all duration-200 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Crear Cuenta
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-muted hover:text-white hover:bg-brand-surface focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-card/95 border-b border-brand-border px-4 pt-2 pb-6 space-y-3">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Buscar juegos..."
              className="w-full bg-brand-surface border border-brand-border rounded-lg pl-9 pr-4 py-2 text-sm text-brand-text placeholder-brand-muted"
            />
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
          </div>
          <Link
            href="/games"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Juegos
          </Link>
          <Link
            href="/reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Reseñas
          </Link>
          <Link
            href="/lists"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Listas
          </Link>
          <Link
            href="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Noticias
          </Link>
          <Link
            href="/critics/exam"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-secondary hover:bg-brand-surface"
          >
            Examen Crítico
          </Link>
          <div className="pt-3 border-t border-brand-border flex gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-brand-surface text-brand-text hover:bg-brand-surface/80"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-brand-primary text-white"
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
