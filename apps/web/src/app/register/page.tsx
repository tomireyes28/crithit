'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirements checks
  const isUsernameValid = /^[a-zA-Z0-9_]{3,24}$/.test(username);
  const isPasswordValid = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isUsernameValid) {
      setError('El nombre de usuario debe tener entre 3 y 24 caracteres (solo letras, números y guiones bajos).');
      return;
    }

    if (!isPasswordValid) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username,
        displayName: displayName.trim() || username,
        email,
        password,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrar la cuenta. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-brand-card border border-brand-border/80 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-brand-secondary to-transparent" />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-secondary to-brand-primary items-center justify-center shadow-glow-secondary mb-2">
          <Gamepad2 className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white">
          Únete a CritHit
        </h2>
        <p className="text-sm text-brand-muted">
          Crea tu perfil gamer, califica del 0 al 100 y conviértete en crítico verificado.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brand-border bg-brand-surface hover:bg-brand-surface/80 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
      >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
            />
          </svg>
          Registrarse con Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-brand-border/60 w-full" />
          <span className="bg-brand-card px-3 text-xs text-brand-muted uppercase tracking-wider font-mono">
            o con tus datos
          </span>
          <div className="border-t border-brand-border/60 w-full" />
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
              Nombre de Usuario (@handle)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="ej: sephiroth_99"
                className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono"
              />
              <span className="text-brand-muted font-mono absolute left-3.5 top-2.5 text-sm">@</span>
            </div>
            {username && (
              <p className={`text-[11px] mt-1 flex items-center gap-1 ${isUsernameValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isUsernameValid ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Nombre de usuario válido
                  </>
                ) : (
                  '3-24 letras, números o guion bajo'
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
              Nombre para Mostrar
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ej: Sephiroth"
                className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
              <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
            </div>
            {password && (
              <p className={`text-[11px] mt-1 flex items-center gap-1 ${isPasswordValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPasswordValid ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Longitud segura
                  </>
                ) : (
                  'Mínimo 8 caracteres requeridos'
                )}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isUsernameValid || !isPasswordValid}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando tu cuenta...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Crear mi Cuenta
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-brand-muted">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-bold text-brand-secondary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-brand-muted text-sm">Cargando...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
