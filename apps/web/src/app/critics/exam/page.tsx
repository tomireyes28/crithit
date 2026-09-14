'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  History,
  Cpu,
  FileCheck,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';

interface ExamQuestion {
  index: number;
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: number;
}

interface StartExamResponse {
  examType: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  passThresholdPercentage: number;
  questions: ExamQuestion[];
}

interface DetailedReviewItem {
  questionId: string;
  question: string;
  options: string[];
  category: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

interface ExamResult {
  attemptId: string;
  passed: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  tierAwarded?: string | null;
  badgeAwarded?: string | null;
  categoryStats?: Record<string, { total: number; correct: number }>;
  detailedReview?: DetailedReviewItem[];
}

export default function CriticExamPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Estados del Examen
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(1200); // 20 minutos
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Iniciar examen al cargar
  const startNewExam = async () => {
    setIsLoadingQuestions(true);
    setResult(null);
    setShowReview(false);
    setAnswers({});
    setCurrentIndex(0);
    setTimeRemaining(1200);

    try {
      const data = await apiClient<StartExamResponse>('/critics/exam/start', {
        method: 'POST',
        body: JSON.stringify({ examType: 'BASIC_CRITIC' }),
      });
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Error al iniciar el examen:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (user) {
      startNewExam();
    }
  }, [user]);

  // Temporizador de cuenta regresiva
  useEffect(() => {
    if (isLoadingQuestions || result || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoadingQuestions, result, questions]);

  const handleSelectOption = (optionIndex: number) => {
    if (result) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleSubmitExam = async () => {
    if (isSubmitting || questions.length === 0) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
      }));

      const res = await apiClient<ExamResult>('/critics/exam/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: answersPayload,
          timeSpentSeconds: 1200 - timeRemaining,
        }),
      });

      setResult(res);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      console.error('Error al evaluar examen:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-surface/80 border border-brand-border flex items-center justify-center text-brand-muted mb-4 shadow-lg">
          <Award className="w-8 h-8 text-brand-primary opacity-80" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Examen de Críticos Acreditados</h1>
        <p className="text-brand-muted text-sm max-w-md mb-6">
          Debes iniciar sesión para rendir la evaluación y recibir tu acreditación oficial.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-bg font-bold text-sm transition-all shadow-md"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-brand-muted">
          Generando conjunto aleatorio de 20 preguntas...
        </span>
      </div>
    );
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'history':
        return { label: 'Historia de la Industria', icon: <History className="w-3.5 h-3.5 text-blue-400" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'mechanics':
        return { label: 'Diseño & Mecánicas', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'technical':
        return { label: 'Técnica & Rendimiento', icon: <Cpu className="w-3.5 h-3.5 text-purple-400" />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'ethics_methodology':
        return { label: 'Ética & Metodología', icon: <FileCheck className="w-3.5 h-3.5 text-amber-400" />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default:
        return { label: 'Cultura General', icon: <Gamepad2 className="w-3.5 h-3.5 text-brand-primary" />, color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30' };
    }
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // ══════════════════════════════════════════════════════════
  // PANTALLA DE RESULTADOS
  // ══════════════════════════════════════════════════════════
  if (result) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Tarjeta de Resumen de Calificación */}
          <div
            className={`p-8 sm:p-10 rounded-3xl border shadow-2xl text-center relative overflow-hidden ${
              result.passed
                ? 'bg-brand-surface/90 border-brand-primary/50 shadow-brand-primary/20'
                : 'bg-brand-surface/80 border-rose-500/40 shadow-rose-500/10'
            }`}
          >
            {/* Ícono de Resultado */}
            <div
              className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl ${
                result.passed
                  ? 'bg-gradient-to-br from-brand-primary to-emerald-400 text-brand-bg'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {result.passed ? (
                result.tierAwarded === 'EXPERT' ? (
                  <Zap className="w-10 h-10" />
                ) : (
                  <ShieldCheck className="w-10 h-10" />
                )
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
            </div>

            {/* Título */}
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {result.passed ? '¡Acreditación Otorgada!' : 'Examen No Aprobado'}
            </h1>

            <p className="text-sm text-brand-muted mt-2 max-w-md mx-auto">
              {result.passed
                ? `Has demostrado un dominio ejemplar de la cultura y técnica de los videojuegos. Se te ha otorgado el rango de ${result.badgeAwarded}.`
                : 'El umbral mínimo de aprobación es del 75%. Revisa el desglose pedagógico de tus respuestas y vuelve a intentarlo.'}
            </p>

            {/* Insignia / Rango Otorgado */}
            {result.passed && (
              <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 text-brand-primary font-black text-sm uppercase tracking-wider shadow-lg">
                <Sparkles className="w-4 h-4" />
                {result.badgeAwarded || 'Verified Critic'}
              </div>
            )}

            {/* Marcador Numérico */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-brand-border/60">
              <div className="p-4 rounded-2xl bg-brand-card/80 border border-brand-border/60">
                <span className="text-xs text-brand-muted block font-semibold">Puntaje Obtenido</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                  {result.score}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-brand-card/80 border border-brand-border/60">
                <span className="text-xs text-brand-muted block font-semibold">Aciertos</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
                  {result.correctAnswers} / {result.totalQuestions}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-brand-card/80 border border-brand-border/60 col-span-2 sm:col-span-1">
                <span className="text-xs text-brand-muted block font-semibold">Umbral Mínimo</span>
                <span className="text-2xl sm:text-3xl font-black text-brand-muted mt-1 block">
                  75%
                </span>
              </div>
            </div>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              {result.passed ? (
                <Link
                  href={`/profile/${user.username}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-bg font-extrabold text-sm transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  Ver Mi Perfil con Insignia
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={startNewExam}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-bg font-extrabold text-sm transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reintentar Examen
                </button>
              )}

              <button
                onClick={() => setShowReview(!showReview)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-brand-primary" />
                {showReview ? 'Ocultar Respuestas' : 'Revisar Respuestas y Explicaciones'}
              </button>
            </div>
          </div>

          {/* Revisión Pedagógica de Preguntas */}
          {showReview && result.detailedReview && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Revisión Detallada de Respuestas</h2>
                <span className="text-xs text-brand-muted">20 preguntas analizadas</span>
              </div>

              <div className="space-y-4">
                {result.detailedReview.map((item, idx) => {
                  const catInfo = getCategoryInfo(item.category);
                  return (
                    <div
                      key={item.questionId}
                      className={`p-5 rounded-2xl border transition-all ${
                        item.isCorrect
                          ? 'bg-brand-surface/60 border-emerald-500/40'
                          : 'bg-brand-surface/60 border-rose-500/40'
                      }`}
                    >
                      {/* Cabecera de Pregunta */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              item.isCorrect
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {item.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </span>
                          <span className="text-xs font-bold text-brand-muted">
                            Pregunta #{idx + 1}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${catInfo.color}`}
                        >
                          {catInfo.icon}
                          {catInfo.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-relaxed mb-4">
                        {item.question}
                      </h4>

                      {/* Opciones */}
                      <div className="space-y-2 mb-4">
                        {item.options.map((opt, optIdx) => {
                          const isUserAnswer = item.userAnswer === optIdx;
                          const isCorrectAnswer = item.correctAnswer === optIdx;

                          let optionStyles = 'bg-brand-card/50 border-brand-border/60 text-brand-muted';
                          if (isCorrectAnswer) {
                            optionStyles = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 font-semibold';
                          } else if (isUserAnswer && !item.isCorrect) {
                            optionStyles = 'bg-rose-500/15 border-rose-500/60 text-rose-300 font-semibold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${optionStyles}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-brand-surface/80 flex items-center justify-center text-[10px] font-black uppercase">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>

                              {isCorrectAnswer && (
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex-shrink-0">
                                  Correcta
                                </span>
                              )}
                              {isUserAnswer && !item.isCorrect && (
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex-shrink-0">
                                  Tu elección
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explicación Pedagógica */}
                      {item.explanation && (
                        <div className="p-3.5 rounded-xl bg-brand-bg/60 border border-brand-border/40 text-xs text-brand-muted leading-relaxed">
                          <span className="font-bold text-brand-primary block mb-1">
                            Fundamento Crítico:
                          </span>
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // INTERFAZ DEL EXAMEN EN VIVO
  // ══════════════════════════════════════════════════════════
  const catInfo = getCategoryInfo(currentQ?.category || '');

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Cabecera del Examen: Título, Progreso y Temporizador */}
        <div className="p-4 sm:p-6 rounded-3xl bg-brand-surface/70 border border-brand-border/80 shadow-xl space-y-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-brand-primary font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                Acreditación de Críticos
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Examen de Cultura & Criterio Lúdico
              </h2>
            </div>

            {/* Temporizador */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-black text-base shadow-sm ${
                timeRemaining <= 180
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-brand-card/90 border-brand-border/80 text-brand-primary'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-brand-muted font-medium">
              <span>
                Pregunta <span className="text-white font-bold">{currentIndex + 1}</span> de{' '}
                {questions.length}
              </span>
              <span>{answeredCount} de {questions.length} respondidas</span>
            </div>
            <div className="w-full h-2 rounded-full bg-brand-card overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Selector Rápido de Preguntas (Grid de 20 puntos) */}
          <div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-2 flex-wrap">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'bg-brand-primary text-brand-bg shadow-md shadow-brand-primary/30 ring-2 ring-brand-primary/60 scale-105'
                      : isAnswered
                      ? 'bg-brand-surface text-brand-primary border border-brand-primary/40'
                      : 'bg-brand-card/70 text-brand-muted border border-brand-border/60 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarjeta de Pregunta Actual */}
        {currentQ && (
          <div className="p-6 sm:p-8 rounded-3xl bg-brand-surface/90 border border-brand-border/80 shadow-2xl space-y-6">
            {/* Categoría */}
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${catInfo.color}`}
              >
                {catInfo.icon}
                {catInfo.label}
              </span>

              <span className="text-xs text-brand-muted font-medium">
                Dificultad: {currentQ.difficulty === 1 ? 'Media' : 'Avanzada'}
              </span>
            </div>

            {/* Enunciado */}
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Opciones */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 group ${
                      isSelected
                        ? 'bg-brand-primary/15 border-brand-primary text-white shadow-lg shadow-brand-primary/10'
                        : 'bg-brand-card/60 hover:bg-brand-card border-brand-border/70 hover:border-brand-primary/40 text-brand-text'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-brand-primary text-brand-bg shadow-md'
                          : 'bg-brand-surface text-brand-muted group-hover:text-white border border-brand-border/80'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-xs sm:text-sm leading-relaxed flex-1">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Controles de Navegación */}
            <div className="flex items-center justify-between pt-6 border-t border-brand-border/60 gap-4">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-brand-card hover:bg-brand-card/80 border border-brand-border text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="px-5 py-2.5 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-bold text-white flex items-center gap-1.5 transition-all"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-bg font-extrabold text-xs transition-all shadow-md shadow-brand-primary/20 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Finalizar y Entregar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Entrega */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 rounded-3xl bg-brand-card border border-brand-border shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 text-brand-primary flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">¿Confirmar entrega del examen?</h3>
                <p className="text-xs text-brand-muted mt-1">
                  Has respondido <span className="text-white font-bold">{answeredCount}</span> de{' '}
                  <span className="text-white font-bold">{questions.length}</span> preguntas.
                  {answeredCount < questions.length && (
                    <span className="text-amber-400 block mt-1 font-semibold">
                      ¡Atención! Tienes {questions.length - answeredCount} preguntas sin responder.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-bold text-white transition-all"
                >
                  Continuar Respondiendo
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-bg font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Calificando...' : 'Sí, Entregar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
