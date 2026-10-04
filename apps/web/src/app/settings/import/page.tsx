'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  Gamepad2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Download,
  Info,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type ImportTab = 'steam' | 'csv';
type CsvFormat = 'auto' | 'backloggd' | 'letterboxd' | 'generic';

interface ParsedGameRow {
  title: string;
  rating?: number | string;
  normalizedScore?: number | null;
  hours?: number;
  status?: string;
  review?: string;
  date?: string;
}

export default function ImportPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ImportTab>('steam');

  // Steam State
  const [steamId, setSteamId] = useState('');
  const [isSteamLoading, setIsSteamLoading] = useState(false);
  const [steamResult, setSteamResult] = useState<any | null>(null);
  const [steamError, setSteamError] = useState<string | null>(null);
  const [showSteamHelp, setShowSteamHelp] = useState(false);

  // CSV State
  const [csvFormat, setCsvFormat] = useState<CsvFormat>('auto');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedGameRow[]>([]);
  const [isCsvParsing, setIsCsvParsing] = useState(false);
  const [isCsvSubmitting, setIsCsvSubmitting] = useState(false);
  const [csvResult, setCsvResult] = useState<any | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalizador auxiliar de notas para previsualización
  const calculateNormalizedScore = (rawRating: any): number | null => {
    if (rawRating === undefined || rawRating === null || rawRating === '') return null;
    const val = Number(rawRating);
    if (isNaN(val)) return null;
    if (val <= 5) return Math.round(val * 20); // 5★ a 0-100
    if (val <= 10) return Math.round(val * 10); // 1-10 a 0-100
    return Math.min(100, Math.max(0, Math.round(val)));
  };

  // 1. Manejo de Steam Sync
  const handleSteamSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steamId.trim()) {
      setSteamError('Por favor ingresa tu Steam ID64 o enlace de perfil.');
      return;
    }

    setIsSteamLoading(true);
    setSteamError(null);
    setSteamResult(null);

    try {
      const res: any = await apiClient('/users/import/steam', {
        method: 'POST',
        body: JSON.stringify({
          steamId: steamId.trim(),
        }),
      });
      setSteamResult(res);
    } catch (err: any) {
      setSteamError(err.message || 'Error al conectar con la biblioteca de Steam.');
    } finally {
      setIsSteamLoading(false);
    }
  };

  // 2. Parser básico de CSV en cliente
  const parseCsvText = (text: string): ParsedGameRow[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    // Separador de comas respetando comillas
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]/g, ''));

    // Encontrar índices de columnas comunes
    const titleIdx = headers.findIndex((h) =>
      ['title', 'name', 'gamename', 'game', 'titulo', 'nombre'].includes(h),
    );
    const ratingIdx = headers.findIndex((h) =>
      ['rating', 'score', 'nota', 'stars', 'calificacion', 'puntuacion'].includes(h),
    );
    const hoursIdx = headers.findIndex((h) =>
      ['hours', 'hoursplayed', 'playtime', 'horas', 'tiempo'].includes(h),
    );
    const statusIdx = headers.findIndex((h) =>
      ['status', 'state', 'estado', 'completion'].includes(h),
    );
    const reviewIdx = headers.findIndex((h) =>
      ['review', 'notes', 'comment', 'reviewtext', 'resena', 'opinion'].includes(h),
    );
    const dateIdx = headers.findIndex((h) =>
      ['date', 'logdate', 'playeddate', 'watcheddate', 'fecha'].includes(h),
    );

    const actualTitleIdx = titleIdx !== -1 ? titleIdx : 0;

    const rows: ParsedGameRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (!cols[actualTitleIdx]) continue;

      const title = cols[actualTitleIdx];
      const rawRating = ratingIdx !== -1 ? cols[ratingIdx] : undefined;
      const hours = hoursIdx !== -1 && cols[hoursIdx] ? Number(cols[hoursIdx]) : undefined;
      const status = statusIdx !== -1 && cols[statusIdx] ? cols[statusIdx] : 'COMPLETED';
      const review = reviewIdx !== -1 && cols[reviewIdx] ? cols[reviewIdx] : undefined;
      const date = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : undefined;

      rows.push({
        title,
        rating: rawRating,
        normalizedScore: calculateNormalizedScore(rawRating),
        hours: isNaN(hours as any) ? undefined : hours,
        status,
        review,
        date,
      });
    }

    return rows;
  };

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setCsvError('El archivo debe tener extensión .csv');
      return;
    }

    setCsvFile(file);
    setIsCsvParsing(true);
    setCsvError(null);
    setCsvResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCsvText(text);
        if (rows.length === 0) {
          setCsvError('No se encontraron columnas de juegos válidas en el archivo CSV.');
        } else {
          setParsedRows(rows);
        }
      } catch (err: any) {
        setCsvError('Error al leer el archivo CSV: ' + err.message);
      } finally {
        setIsCsvParsing(false);
      }
    };
    reader.onerror = () => {
      setCsvError('Error al leer el archivo desde el dispositivo');
      setIsCsvParsing(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleCsvSubmit = async () => {
    if (parsedRows.length === 0) {
      setCsvError('No hay registros listos para importar.');
      return;
    }

    setIsCsvSubmitting(true);
    setCsvError(null);

    try {
      const res: any = await apiClient('/users/import/csv', {
        method: 'POST',
        body: JSON.stringify({
          format: csvFormat,
          rows: parsedRows.map((r) => ({
            title: r.title,
            rating: r.rating,
            hours: r.hours,
            status: r.status,
            review: r.review,
            date: r.date,
          })),
        }),
      });
      setCsvResult(res);
    } catch (err: any) {
      setCsvError(err.message || 'Error al procesar la importación CSV.');
    } finally {
      setIsCsvSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cabecera & Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-muted mb-2">
            <Link href="/" className="hover:text-brand-accent transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Configuración</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-accent font-semibold">Importar Biblioteca</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <UploadCloud className="w-8 h-8 text-brand-accent" />
                Importar Biblioteca Gamer
              </h1>
              <p className="text-sm text-brand-muted mt-1 max-w-2xl">
                Trae tus horas jugadas, estados y reseñas desde Steam, Backloggd o Letterboxd.
                Mapeamos automáticamente tus notas a la escala universal de CritHit (0-100).
              </p>
            </div>

            {user && (
              <Link
                href={`/profile/${user.username}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-surface hover:bg-brand-border/60 border border-brand-border text-brand-muted hover:text-white transition-all self-start sm:self-auto"
              >
                <span>Ver Mi Perfil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Advertencia si no está autenticado */}
        {!isAuthLoading && !user && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <span className="font-bold block text-sm mb-0.5">Sesión no iniciada</span>
              Para guardar los juegos importados en tu perfil y diario personal, necesitas{' '}
              <Link href="/login" className="underline font-bold text-white hover:text-amber-300">
                iniciar sesión
              </Link>{' '}
              o{' '}
              <Link href="/register" className="underline font-bold text-white hover:text-amber-300">
                crear una cuenta
              </Link>
              .
            </div>
          </div>
        )}

        {/* Selector de Pestañas */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-brand-surface/60 border border-brand-border/60 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('steam')}
            className={`flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'steam'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg'
                : 'text-brand-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Steam Sync Directo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'csv'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 shadow-lg'
                : 'text-brand-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV (Backloggd / Letterboxd)</span>
          </button>
        </div>

        {/* PESTAÑA 1: STEAM SYNC */}
        {activeTab === 'steam' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-brand-card/70 border border-brand-border/80 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                    Sincronización con Cuenta de Steam
                  </h2>
                  <p className="text-xs text-brand-muted">
                    Conéctate mediante tu SteamID64 o enlace público para importar tu catálogo con horas totales y estados de juego.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSteamHelp(!showSteamHelp)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 flex-shrink-0"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>¿Cómo lo encuentro?</span>
                </button>
              </div>

              {/* Ayuda desplegable para Steam ID */}
              <AnimatePresence>
                {showSteamHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200/90 space-y-2 overflow-hidden"
                  >
                    <p className="font-semibold text-cyan-300">
                      Instrucciones para obtener tu SteamID o URL pública:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-cyan-200/80">
                      <li>Abre Steam y dirígete a tu Perfil.</li>
                      <li>
                        Copia la URL de tu perfil (ej:{' '}
                        <code className="text-white bg-black/40 px-1 py-0.5 rounded">
                          https://steamcommunity.com/id/tu_usuario
                        </code>{' '}
                        o{' '}
                        <code className="text-white bg-black/40 px-1 py-0.5 rounded">
                          76561198000000000
                        </code>
                        ).
                      </li>
                      <li>Asegúrate de que en Privacidad de Perfil, los "Detalles del Juego" estén marcados como Públicos.</li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulario */}
              <form onSubmit={handleSteamSync} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                    Steam ID64 o Enlace de Perfil
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={steamId}
                      onChange={(e) => setSteamId(e.target.value)}
                      placeholder="Ej: 76561198031234567 o https://steamcommunity.com/id/gaben"
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5 text-sm text-white placeholder-brand-muted/50 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                    />
                    <Gamepad2 className="w-5 h-5 text-brand-muted/40 absolute right-4 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {steamError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{steamError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSteamLoading || !steamId.trim()}
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSteamLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sincronizando Biblioteca de Steam...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Sincronizar e Importar Juegos</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resultado Exitoso */}
              {steamResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base">¡Sincronización Completada!</h3>
                      <p className="text-xs text-brand-muted">{steamResult.message}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border/60">
                      <div className="text-xs text-brand-muted">Juegos Importados</div>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        {steamResult.importedCount}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border/60">
                      <div className="text-xs text-brand-muted">Horas Totales Registradas</div>
                      <div className="text-2xl font-black text-cyan-300 font-mono mt-0.5">
                        {steamResult.totalPlaytimeHours}h
                      </div>
                    </div>
                  </div>

                  {/* Previsualización de juegos importados */}
                  {steamResult.games && steamResult.games.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                        Títulos sincronizados:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {steamResult.games.map((g: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-brand-surface/40 border border-brand-border/40 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-white truncate max-w-[180px]">
                              {g.name}
                            </span>
                            <span className="text-cyan-400 font-mono font-bold flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {g.hours}h
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/diary"
                      className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-all"
                    >
                      Ver en Mi Diario
                    </Link>
                    {user && (
                      <Link
                        href={`/profile/${user.username}`}
                        className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-border text-white transition-all"
                      >
                        Ver Perfil
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* PESTAÑA 2: IMPORTAR CSV */}
        {activeTab === 'csv' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-brand-card/70 border border-brand-border/80 backdrop-blur-md shadow-xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  Importar Archivo CSV de Backloggd o Letterboxd
                </h2>
                <p className="text-xs text-brand-muted">
                  Sube el archivo <code className="text-emerald-300 font-mono">.csv</code> exportado de tu plataforma anterior.
                  Convertimos tus estrellas a la escala CritHit 0-100 conservando tus reseñas y fechas.
                </p>
              </div>

              {/* Selector de formato origen */}
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                  Formato de Origen
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'auto', label: 'Detección Auto' },
                    { id: 'backloggd', label: 'Backloggd' },
                    { id: 'letterboxd', label: 'Letterboxd' },
                    { id: 'generic', label: 'CSV Genérico' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCsvFormat(f.id as CsvFormat)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        csvFormat === f.id
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                          : 'bg-brand-surface/40 border-brand-border text-brand-muted hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zona Drag & Drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-brand-border hover:border-emerald-500/50 hover:bg-brand-surface/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>

                <div>
                  <div className="text-sm font-bold text-white">
                    {csvFile ? csvFile.name : 'Arrastra tu archivo .CSV aquí o haz clic para seleccionarlo'}
                  </div>
                  <div className="text-xs text-brand-muted mt-1">
                    {csvFile
                      ? `${(csvFile.size / 1024).toFixed(1)} KB detectados`
                      : 'Soporta exportaciones completas con títulos, estrellas, reseñas y fechas'}
                  </div>
                </div>
              </div>

              {/* Errores */}
              {csvError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{csvError}</span>
                </div>
              )}

              {/* Previsualización de filas leídas */}
              {parsedRows.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Se detectaron {parsedRows.length} juegos listos para importar
                    </span>
                    <span className="text-brand-muted">Muestra de las primeras 5 filas</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-brand-border/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-surface text-brand-muted border-b border-brand-border/60 font-mono">
                        <tr>
                          <th className="py-2.5 px-3">Título</th>
                          <th className="py-2.5 px-3">Nota Original</th>
                          <th className="py-2.5 px-3">Nota CritHit (0-100)</th>
                          <th className="py-2.5 px-3">Horas</th>
                          <th className="py-2.5 px-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/40">
                        {parsedRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-brand-surface/40">
                            <td className="py-2.5 px-3 font-semibold text-white max-w-[200px] truncate">
                              {row.title}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-brand-muted">
                              {row.rating !== undefined ? `${row.rating} ★` : '—'}
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {row.normalizedScore !== null ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                  {row.normalizedScore}
                                </span>
                              ) : (
                                <span className="text-brand-muted">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-brand-muted">
                              {row.hours !== undefined ? `${row.hours}h` : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-brand-muted">
                              {row.status || 'COMPLETED'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleCsvSubmit}
                    disabled={isCsvSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isCsvSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Procesando e Importando {parsedRows.length} Juegos...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Confirmar e Importar {parsedRows.length} Registros</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Resultado Exitoso de CSV */}
              {csvResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base">¡Importación Exitosa!</h3>
                      <p className="text-xs text-brand-muted">{csvResult.message}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border/60">
                      <div className="text-xs text-brand-muted">Títulos Procesados</div>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        {csvResult.importedCount}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border/60">
                      <div className="text-xs text-brand-muted">Notas Mapeadas (0-100)</div>
                      <div className="text-2xl font-black text-emerald-300 font-mono mt-0.5">
                        {csvResult.matchedCount}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/diary"
                      className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all"
                    >
                      Ver en Mi Diario
                    </Link>
                    {user && (
                      <Link
                        href={`/profile/${user.username}`}
                        className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-border text-white transition-all"
                      >
                        Ver Perfil
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Tarjeta Informativa sobre Normalización de Notas */}
            <div className="p-6 rounded-3xl bg-brand-card/40 border border-brand-border/60 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ¿Cómo funciona la conversión de notas a CritHit?
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Backloggd y Letterboxd usan una escala tradicional de 5 estrellas (con incrementos de 0.5).
                En CritHit usamos una escala granular de 0 a 100. Al importar, convertimos:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-brand-surface/40 border border-brand-border/40 text-center">
                  <span className="text-brand-muted">5.0 ★</span> → <span className="font-bold text-emerald-400">100</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-surface/40 border border-brand-border/40 text-center">
                  <span className="text-brand-muted">4.5 ★</span> → <span className="font-bold text-emerald-400">90</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-surface/40 border border-brand-border/40 text-center">
                  <span className="text-brand-muted">4.0 ★</span> → <span className="font-bold text-teal-400">80</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-surface/40 border border-brand-border/40 text-center">
                  <span className="text-brand-muted">3.5 ★</span> → <span className="font-bold text-cyan-400">70</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
