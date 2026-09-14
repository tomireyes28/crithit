import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SubmitExamDto, StartExamDto } from './dto/critic.dto';
import { CriticTier, ExamType } from '@prisma/client';

@Injectable()
export class CriticsService {
  private readonly logger = new Logger(CriticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewsService: ReviewsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Obtiene el estado actual de acreditación del usuario
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        criticTier: true,
        criticBadge: true,
        criticVerifiedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const [totalAttempts, bestAttempt, lastAttempt] = await Promise.all([
      this.prisma.criticExamAttempt.count({ where: { userId } }),
      this.prisma.criticExamAttempt.findFirst({
        where: { userId },
        orderBy: { score: 'desc' },
        select: { score: true, passed: true, attemptedAt: true },
      }),
      this.prisma.criticExamAttempt.findFirst({
        where: { userId },
        orderBy: { attemptedAt: 'desc' },
        select: { id: true, score: true, passed: true, attemptedAt: true },
      }),
    ]);

    return {
      isCritic: user.role === 'CRITIC' || Boolean(user.criticTier),
      criticTier: user.criticTier,
      criticBadge: user.criticBadge,
      criticVerifiedAt: user.criticVerifiedAt,
      totalAttempts,
      bestScore: bestAttempt?.score ?? null,
      lastAttempt,
    };
  }

  /**
   * Inicia una sesión de examen seleccionando aleatoriamente 20 preguntas
   * sin exponer las respuestas correctas.
   */
  async startExam(userId: string, dto: StartExamDto) {
    const examType = (dto.examType as ExamType) || 'BASIC_CRITIC';

    // Obtener preguntas activas del tipo especificado
    const pool = await this.prisma.examQuestion.findMany({
      where: {
        examType,
        isActive: true,
      },
    });

    if (pool.length === 0) {
      throw new NotFoundException('No hay preguntas disponibles para este examen');
    }

    // Mezclar aleatoriamente (Fisher-Yates)
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Tomar 20 preguntas (o el total si hay menos)
    const selected = shuffled.slice(0, 20);

    // Mapear ocultando la respuesta correcta y la explicación pedagógica
    const sanitizedQuestions = selected.map((q, index) => ({
      index: index + 1,
      id: q.id,
      question: q.question,
      options: q.options as string[],
      category: q.category,
      difficulty: q.difficulty,
    }));

    return {
      examType,
      totalQuestions: sanitizedQuestions.length,
      timeLimitMinutes: 20,
      passThresholdPercentage: 75,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Corrige y evalúa las respuestas enviadas, otorga rango de crítico si aprueba
   * y recalcula retroactivamente las reseñas del usuario.
   */
  async submitExam(userId: string, dto: SubmitExamDto) {
    if (!dto.answers || dto.answers.length === 0) {
      throw new BadRequestException('Debe enviar al menos una respuesta');
    }

    // Obtener las preguntas reales de la base de datos
    const questionIds = dto.answers.map((a) => a.questionId);
    const dbQuestions = await this.prisma.examQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(dbQuestions.map((q) => [q.id, q]));

    let correctCount = 0;
    const categoryStats: Record<string, { total: number; correct: number }> = {};

    const detailedReview = dto.answers.map((ans) => {
      const q = questionMap.get(ans.questionId);
      if (!q) return null;

      const isCorrect = ans.selectedOption === q.correctOption;
      if (isCorrect) correctCount++;

      // Conteo por categoría
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, correct: 0 };
      }
      categoryStats[q.category].total++;
      if (isCorrect) {
        categoryStats[q.category].correct++;
      }

      return {
        questionId: q.id,
        question: q.question,
        options: q.options as string[],
        category: q.category,
        userAnswer: ans.selectedOption,
        correctAnswer: q.correctOption,
        isCorrect,
        explanation: q.explanation,
      };
    }).filter(Boolean);

    const totalQuestions = detailedReview.length;
    if (totalQuestions === 0) {
      throw new BadRequestException('No se encontraron las preguntas enviadas');
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 75;

    // Determinar nuevo rango si aprobó
    let newTier: CriticTier | null = null;
    let newBadge: string | null = null;

    if (passed) {
      if (score >= 90) {
        newTier = 'EXPERT';
        newBadge = 'Expert Critic';
      } else {
        newTier = 'VERIFIED';
        newBadge = 'Verified Critic';
      }
    }

    // Registrar el intento en la base de datos
    const attempt = await this.prisma.criticExamAttempt.create({
      data: {
        userId,
        examType: 'BASIC_CRITIC',
        score,
        passed,
        totalQuestions,
        correctAnswers: correctCount,
        answers: detailedReview as any,
      },
    });

    // Si aprobó, actualizar el perfil del usuario (sin degradar si ya tenía un rango superior)
    if (passed && newTier) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { criticTier: true },
      });

      let shouldUpdateTier = true;
      if (currentUser?.criticTier === 'MASTER') {
        shouldUpdateTier = false;
      } else if (currentUser?.criticTier === 'EXPERT' && newTier === 'VERIFIED') {
        shouldUpdateTier = false;
      }

      if (shouldUpdateTier) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            role: 'CRITIC',
            criticTier: newTier,
            criticBadge: newBadge,
            criticVerifiedAt: new Date(),
          },
        });
      }

      // Actualizar retroactivamente las reseñas anteriores del usuario a reseñas de crítico
      const userReviews = await this.prisma.review.findMany({
        where: { userId },
        select: { id: true, gameId: true },
      });

      if (userReviews.length > 0) {
        await this.prisma.review.updateMany({
          where: { userId },
          data: {
            isCriticReview: true,
            criticTier: newTier,
          },
        });

        // Recalcular puntuaciones oficiales de la crítica en los juegos afectados
        const uniqueGameIds = Array.from(new Set(userReviews.map((r) => r.gameId)));
        await Promise.all(
          uniqueGameIds.map((gameId) =>
            this.reviewsService.recalculateGameScores(gameId).catch((err) => {
              this.logger.warn(`Error recalculando puntuaciones del juego ${gameId}: ${err.message}`);
            }),
          ),
        );
      }

      // Disparar notificación al usuario acreditado
      await this.notificationsService
        .createNotification({
          recipientId: userId,
          type: 'CRITIC_STATUS_CHANGE',
          message: `¡Felicitaciones! Has aprobado el examen de acreditación con ${score}% y obtenido el rango de ${newBadge}.`,
          entityType: 'CRITIC',
          entityId: newTier,
        })
        .catch(() => {});
    }

    return {
      attemptId: attempt.id,
      passed,
      score,
      correctAnswers: correctCount,
      totalQuestions,
      tierAwarded: passed ? newTier : null,
      badgeAwarded: passed ? newBadge : null,
      categoryStats,
      detailedReview,
    };
  }

  /**
   * Historial de exámenes del usuario
   */
  async getHistory(userId: string) {
    const attempts = await this.prisma.criticExamAttempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: 'desc' },
      select: {
        id: true,
        examType: true,
        score: true,
        passed: true,
        totalQuestions: true,
        correctAnswers: true,
        attemptedAt: true,
      },
    });

    return attempts;
  }

  /**
   * Obtiene los críticos más activos y destacados de la comunidad
   */
  async getLeaderboard() {
    const critics = await this.prisma.user.findMany({
      where: {
        OR: [{ role: 'CRITIC' }, { criticTier: { not: null } }],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        criticTier: true,
        criticBadge: true,
        criticVerifiedAt: true,
        _count: {
          select: {
            reviews: true,
            followers: true,
          },
        },
      },
      orderBy: [{ reviews: { _count: 'desc' } }, { followers: { _count: 'desc' } }],
      take: 10,
    });

    return critics.map((c) => ({
      id: c.id,
      username: c.username,
      displayName: c.displayName,
      avatarUrl: c.avatarUrl,
      criticTier: c.criticTier,
      criticBadge: c.criticBadge,
      criticVerifiedAt: c.criticVerifiedAt,
      reviewCount: c._count.reviews,
      followerCount: c._count.followers,
    }));
  }
}
