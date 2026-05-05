import express from 'express';
import sheetsService from '../services/sheetsService.js';
import deviceService from '../services/deviceService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Get user info - authentification requise
 * Retourne les infos de l'utilisateur authentifié
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const deviceToken = authHeader.slice(7);
    const verification = deviceService.verifyDeviceToken(deviceToken);
    
    if (!verification.valid) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    const { firstName, lastName } = verification.user;
    const user = await sheetsService.findUserByName(firstName, lastName);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Retourner uniquement les infos nécessaires (pas d'exposition d'ID)
    res.json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || '',
        birthDate: user.birthDate || '',
      },
    });
  } catch (error) {
    logger.error('Error getting user info:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

/**
 * DEPRECATED - Ancien endpoint d'énumération (maintenant bloqué)
 * Retourne 404 pour empêcher l'énumération d'utilisateurs
 */
router.get('/:userId', (req, res) => {
  res.status(404).json({ error: 'Endpoint non disponible' });
});

/**
 * DEPRECATED - Ancien endpoint d'énumération (maintenant bloqué)
 */
router.get('/', (req, res) => {
  res.status(404).json({ error: 'Endpoint non disponible' });
});

export default router;
