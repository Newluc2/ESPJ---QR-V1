import express from 'express';
import sheetsService from '../services/sheetsService.js';
import deviceService from '../services/deviceService.js';
import { validateSchema, attendanceSchema } from '../utils/validation.js';
import { auditLogger } from '../utils/logger.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Register attendance (arrival or departure)
 * Requi're un deviceToken valide (Bearer token dans le header Authorization)
 */
router.post('/register', validateSchema(attendanceSchema), async (req, res) => {
  try {
    const { deviceToken } = req.validatedData;

    // Vérifier le token et récupérer l'utilisateur
    const verification = deviceService.verifyDeviceToken(deviceToken);
    
    if (!verification.valid) {
      logger.warn('Attendance register: invalid token', { ip: req.ip });
      return res.status(401).json({ error: 'Authentication requise' });
    }

    const { firstName, lastName } = verification.user;

    // Récupérer les données complètes de l'utilisateur
    const user = await sheetsService.findUserByName(firstName, lastName);

    if (!user) {
      logger.error('Attendance: user not found after verified token', { firstName, lastName });
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà un enregistrement aujourd'hui
    const existingRecord = await sheetsService.getUserAttendanceToday(user.id);
    const attendanceType = existingRecord ? 'departure' : 'arrival';

    // Ajouter ou mettre à jour le pointage de manière atomique
    const result = await sheetsService.addOrUpdateAttendance(
      user.id,
      user,
      attendanceType
    );

    auditLogger('attendance_' + attendanceType, firstName + ' ' + lastName, {
      userId: user.id,
      ip: req.ip,
    }, 'success');

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error registering attendance:', error);
    auditLogger('attendance_error', 'unknown', {
      error: error.message,
      ip: req.ip,
    }, 'error');
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du pointage' });
  }
});

/**
 * Get user attendance today
 * Requi're authentification
 */
router.post('/today', async (req, res) => {
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

    const attendance = await sheetsService.getUserAttendanceToday(user.id);

    res.json({
      success: true,
      attendance: attendance || null,
      message: attendance ? 'Pointage enregistré' : 'Pas de pointage aujourd\'hui',
    });
  } catch (error) {
    logger.error('Error getting attendance:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du pointage' });
  }
});

export default router;
