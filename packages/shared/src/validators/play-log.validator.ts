import { z } from 'zod';

export const playStatusEnum = z.enum([
  'PLAYING',
  'BACKLOG',
  'COMPLETED',
  'MASTERED',
  'DROPPED',
  'SHELVED',
  'WISHLIST',
]);

export const createPlayLogSchema = z.object({
  gameId: z.string().min(1, 'El identificador del juego es requerido'),
  status: playStatusEnum,
  startedAt: z.string().datetime({ offset: true }).optional().or(z.string().date()).nullable(),
  finishedAt: z.string().datetime({ offset: true }).optional().or(z.string().date()).nullable(),
  logDate: z.string().datetime({ offset: true }).optional().or(z.string().date()),
  platform: z.string().trim().max(50).optional(),
  hoursPlayed: z.number().min(0).max(10000).optional(),
  isReplay: z.boolean().default(false),
  replayCount: z.number().int().min(0).default(0),
  notes: z.string().max(2000).optional(),
});

export type CreatePlayLogInput = z.infer<typeof createPlayLogSchema>;

export const updatePlayLogSchema = createPlayLogSchema.partial().omit({ gameId: true });

export type UpdatePlayLogInput = z.infer<typeof updatePlayLogSchema>;
