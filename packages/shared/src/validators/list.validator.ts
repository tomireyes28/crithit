import { z } from 'zod';

export const createListSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'El título de la lista debe tener al menos 2 caracteres')
    .max(100, 'El título de la lista no puede exceder 100 caracteres'),
  description: z.string().trim().max(2000, 'La descripción no puede exceder 2000 caracteres').optional(),
  coverImageUrl: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
  isRanked: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string().trim().max(30)).max(10, 'Máximo 10 etiquetas').default([]),
  initialGames: z
    .array(
      z.object({
        gameId: z.string().min(1),
        note: z.string().max(500).optional(),
      }),
    )
    .optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;

export const updateListSchema = createListSchema.partial();

export type UpdateListInput = z.infer<typeof updateListSchema>;

export const addListEntrySchema = z.object({
  gameId: z.string().min(1, 'El identificador del juego es requerido'),
  position: z.number().int().min(1).optional(),
  note: z.string().trim().max(500, 'La nota no puede exceder 500 caracteres').optional(),
});

export type AddListEntryInput = z.infer<typeof addListEntrySchema>;
