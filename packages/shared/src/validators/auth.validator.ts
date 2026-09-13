import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(24, 'El nombre de usuario no puede exceder 24 caracteres')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'El nombre de usuario solo puede contener letras, números y guiones bajos',
    ),
  displayName: z
    .string()
    .trim()
    .min(2, 'El nombre para mostrar debe tener al menos 2 caracteres')
    .max(50, 'El nombre para mostrar no puede exceder 50 caracteres'),
  email: z.string().trim().toLowerCase().email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  bio: z.string().max(500, 'La biografía no puede exceder 500 caracteres').optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
