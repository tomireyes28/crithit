import { CriticTierDetails } from '../types/critic.types.js';

export const CRITIC_TIER_CONFIG: Record<string, CriticTierDetails> = {
  VERIFIED: {
    tier: 'VERIFIED',
    title: 'Crítico Verificado',
    description: 'Aprobó el examen de acreditación inicial y cuenta con un historial de reseñas.',
    badgeLabel: 'Verified Critic',
    colorHex: '#38BDF8',
    bgClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    requirements: {
      accountAgeDays: 14,
      minReviews: 10,
      minLikes: 15,
      examMinScore: 70,
    },
    benefits: [
      'Tus puntuaciones influyen en el Critic Score global.',
      'Badge distintivo de Crítico Verificado en perfil y publicaciones.',
      'Tus reseñas aparecen en la pestaña destacada de Críticos.',
    ],
  },
  EXPERT: {
    tier: 'EXPERT',
    title: 'Crítico Experto',
    description: 'Trayectoria destacada en la comunidad y aprobación del examen avanzado.',
    badgeLabel: 'Expert Critic',
    colorHex: '#F59E0B',
    bgClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    requirements: {
      accountAgeDays: 60,
      minReviews: 40,
      minLikes: 100,
      examMinScore: 85,
    },
    benefits: [
      'Mayor ponderación en el cálculo del Critic Score.',
      'Badge dorado de Crítico Experto.',
      'Posicionamiento prioritario en las fichas de juegos principales.',
      'Acceso a reseñas anticipadas con cuenta regresiva de embargo.',
    ],
  },
  MASTER: {
    tier: 'MASTER',
    title: 'Master Critic',
    description: 'Máximo nivel de excelencia crítica otorgado por distinción y mérito comprobado.',
    badgeLabel: 'Master Critic',
    colorHex: '#C084FC',
    bgClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    requirements: {
      accountAgeDays: 180,
      minReviews: 100,
      minLikes: 300,
      examMinScore: 95,
    },
    benefits: [
      'Máxima ponderación y panel de autor en la página de inicio.',
      'Badge platino de Master Critic.',
      'Capacidad de crear y curar listas oficiales de CritHit.',
    ],
  },
};

export function getCriticTierDetails(tier: string): CriticTierDetails | undefined {
  return CRITIC_TIER_CONFIG[tier];
}
