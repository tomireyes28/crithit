'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Search,
  Award,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Bookmark,
  MessageSquare,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { CommandPaletteModal } from '@/components/navigation/CommandPaletteModal';
import { MagneticHover, BouncyTap, ShimmerButton } from '@/components/ui/MotionWrapper';

export const Navbar = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { user, logout } = useAuth();

  // Atajo de teclado global Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with Magnetic attraction */}
          <div className="flex items-center gap-8">
            <MagneticHover pullDistance={6}>
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary via-indigo-600 to-brand-secondary flex items-center justify-center shadow-[0_0_20px_rgba(108,92,231,0.4)] group-hover:shadow-[0_0_28px_rgba(0,210,255,0.6)] group-hover:scale-105 transition-all duration-300">
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
            </MagneticHover>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/games"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Juegos
              </Link>
              <Link
                href="/diary"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Diario
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
                href="/activity"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Actividad
              </Link>
              <Link
                href="/news"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Noticias
              </Link>
              <Link
                href="/calendar"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-surface/60 transition-colors"
              >
                Calendario
              </Link>
              <Link
                href="/critics"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-brand-secondary hover:text-white hover:bg-brand-secondary/10 transition-colors flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-brand-secondary" />
                Críticos
              </Link>
            </div>
          </div>

          {/* Search bar & Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Command Palette Trigger (Desktop) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center justify-between w-60 lg:w-64 bg-brand-card/90 hover:bg-brand-surface/90 border border-brand-border/80 hover:border-brand-secondary/40 rounded-xl pl-3 pr-2.5 py-1.5 text-xs text-brand-muted hover:text-white transition-all group shadow-inner"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-brand-muted group-hover:text-brand-secondary transition-colors flex-shrink-0" />
                <span className="truncate">Buscar juegos, listas...</span>
              </div>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-bg/90 border border-brand-border/80 text-brand-muted group-hover:text-brand-secondary flex-shrink-0">
                <span>⌘</span>K
              </kbd>
            </button>

            {/* Notification Bell & Dropdown */}
            {user && <NotificationDropdown />}

            {/* User Session Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-brand-card hover:bg-brand-surface border border-brand-border/80 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      user.username.charAt(0)
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white max-w-[100px] truncate">
                    {user.displayName || user.username}
                  </span>
                  {user.criticTier && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-500/30">
                      Critic
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-brand-card border border-brand-border rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-brand-border/60">
                      <p className="text-xs text-brand-muted">Conectado como</p>
                      <p className="text-sm font-bold text-white truncate">@{user.username}</p>
                    </div>

                    <Link
                      href={`/profile/${user.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-brand-primary" />
                      Mi Perfil
                    </Link>

                    <Link
                      href="/notifications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
                    >
                      <Bell className="w-4 h-4 text-brand-primary" />
                      Notificaciones
                    </Link>

                    <Link
                      href="/diary"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-brand-primary" />
                      Mi Diario
                    </Link>

                    <Link
                      href={`/profile/${user.username}?tab=reviews`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-brand-secondary" />
                      Mis Reseñas
                    </Link>

                    <Link
                      href="/diary?status=BACKLOG"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-brand-tertiary" />
                      Mi Backlog
                    </Link>

                    <div className="border-t border-brand-border/60 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-brand-muted hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <ShimmerButton
                  href="/register"
                  variant="primary"
                  size="sm"
                  icon={<Sparkles className="w-3.5 h-3.5 text-cyan-200" />}
                >
                  Crear Cuenta
                </ShimmerButton>
              </div>
            )}
          </div>

          {/* Mobile menu toggle & quick search */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-2 rounded-xl text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5 text-brand-secondary" />
            </button>
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
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsCommandPaletteOpen(true);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-muted hover:text-white transition-colors mb-3"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-secondary" />
              <span>Buscar juegos, usuarios, listas...</span>
            </div>
            <span className="font-mono text-[10px] bg-brand-bg px-1.5 py-0.5 rounded border border-brand-border">⌘K</span>
          </button>
          <Link
            href="/games"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Juegos
          </Link>
          <Link
            href="/diary"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Diario
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
            href="/activity"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Actividad
          </Link>
          <Link
            href="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Noticias
          </Link>
          <Link
            href="/calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-muted hover:text-white hover:bg-brand-surface"
          >
            Calendario
          </Link>
          <Link
            href="/critics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-secondary hover:bg-brand-surface"
          >
            Críticos Acreditados
          </Link>

          <div className="pt-3 border-t border-brand-border">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-sm font-bold text-white">
                  @{user.username}
                </div>
                <Link
                  href={`/profile/${user.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-brand-muted hover:text-white"
                >
                  Mi Perfil
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-sm text-brand-muted hover:text-white"
                >
                  <span>Notificaciones</span>
                  <Bell className="w-4 h-4 text-brand-primary" />
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:text-rose-300"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
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
            )}
          </div>
        </div>
      )}

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </nav>
  );
};
