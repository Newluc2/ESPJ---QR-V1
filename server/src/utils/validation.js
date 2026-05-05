import { z } from 'zod';

// Validation schemas pour tous les endpoints

export const loginSchema = z.object({
  firstName: z.string()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long')
    .regex(/^[a-zA-Zà-ÿé\s'-]{1,50}$/, 'Prénom invalide'),
  lastName: z.string()
    .min(1, 'Nom requis')
    .max(50, 'Nom trop long')
    .regex(/^[a-zA-Zà-ÿé\s'-]{1,50}$/, 'Nom invalide'),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

export const attendanceSchema = z.object({
  deviceToken: z.string()
    .min(20, 'Token invalide')
    .max(500, 'Token invalide'),
  timestamp: z.number().optional(),
});

export const addUserSchema = z.object({
  id: z.string()
    .min(3, 'ID utilisateur doit avoir au minimum 3 caractères')
    .max(20, 'ID utilisateur trop long')
    .regex(/^[A-Z0-9_-]{3,20}$/, 'ID format invalide (alphanuméprique, tirets, underscores)'),
  firstName: z.string()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long')
    .regex(/^[a-zA-Zà-ÿé\s'-]{1,50}$/, 'Prénom invalide'),
  lastName: z.string()
    .min(1, 'Nom requis')
    .max(50, 'Nom trop long')
    .regex(/^[a-zA-Zà-ÿé\s'-]{1,50}$/, 'Nom invalide'),
  email: z.string().email('Email invalide').optional(),
  birthDate: z.string().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string()
    .min(1, 'Prénom requis')
    .max(50, 'Prénom trop long')
    .regex(/^[a-zA-Zà-ÿé\s'-]{1,50}$/, 'Prénom invalide'),
  lastName: z.string()
    .min(1, 'Nom requis')
    .max(50, 'Nom trop long')
    .regex(/^[a-zA-Zà-ÿé\s'-]{1,50}$/, 'Nom invalide'),
  email: z.string().email('Email invalide').optional(),
  birthDate: z.string().optional(),
});

export const qrcodeSchema = z.object({
  userId: z.string()
    .min(3, 'ID utilisateur invalide')
    .max(20, 'ID utilisateur invalide'),
});

export const verifyTokenSchema = z.object({
  deviceToken: z.string()
    .min(20, 'Token invalide')
    .max(500, 'Token invalide'),
});

export const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedData = validated;
      next();
    } catch (error) {
      // Retourner une erreur générique pour ne pas révéler la structure
      return res.status(400).json({
        error: 'Données invalides',
        message: 'Les paramètres fournis sont invalides',
      });
    }
  };
};
