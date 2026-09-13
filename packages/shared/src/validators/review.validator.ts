import { z } from 'zod';

export const createReviewSchema = z.object({
  gameId: z.string().min(1, 'El identificador del juego es requerido'),
  score: z
    .number({ invalid_type_error: 'La puntuación debe ser un número' })
    .int('La puntuación debe ser un número entero')
    .min(0, 'La puntuación mínima es 0')
    .max(100, 'La puntuación máxima es 100'),
  title: z.string().trim().max(120, 'El título no puede exceder 120 caracteres').optional(),
  body: z.string().trim().max(10000, 'La reseña no puede exceder 10,000 caracteres').optional(),
  platform: z.string().trim().max(50).optional(),
  playtimeAtReview: z
    .number()
    .min(0, 'Las horas no pueden ser negativas')
    .max(10000, 'Horas de juego excedidas')
    .optional(),
  gameVersion: z.string().trim().max(50).optional(),
  containsSpoilers: z.boolean().default(false),
  recommends: z.boolean().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = createReviewSchema.partial().omit({ gameId: true });

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
