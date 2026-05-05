import { logger } from '../services/logger.js';

/**
 * Middleware de validation de schéma
 */
export const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const data = req.body;

      // Validation simple - À remplacer par zod ou joi en production
      if (schema.required) {
        for (const field of schema.required) {
          if (!data[field]) {
            return res.status(400).json({ 
              error: `Champ requis: ${field}` 
            });
          }
        }
      }

      if (schema.properties) {
        for (const [field, rules] of Object.entries(schema.properties)) {
          if (data[field] !== undefined) {
            // Validation de type
            if (rules.type && typeof data[field] !== rules.type) {
              return res.status(400).json({
                error: `Type invalide pour ${field}: attendu ${rules.type}, reçu ${typeof data[field]}`
              });
            }

            // Validation de longueur minimale
            if (rules.minLength && data[field].length < rules.minLength) {
              return res.status(400).json({
                error: `${field} doit contenir au moins ${rules.minLength} caractères`
              });
            }

            // Validation de longueur maximale
            if (rules.maxLength && data[field].length > rules.maxLength) {
              return res.status(400).json({
                error: `${field} doit contenir au maximum ${rules.maxLength} caractères`
              });
            }

            // Validation de pattern
            if (rules.pattern && !new RegExp(rules.pattern).test(data[field])) {
              return res.status(400).json({
                error: `Format invalide pour ${field}`
              });
            }
          }
        }
      }

      req.validatedData = data;
      next();
    } catch (error) {
      logger.error('Validation error', { error: error.message });
      res.status(500).json({ error: 'Erreur de validation' });
    }
  };
};

export default validateSchema;
