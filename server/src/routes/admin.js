import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { adminMiddleware } from '../middleware/auth.js';
import sheetsService from '../services/sheetsService.js';
import { validateSchema, addUserSchema, qrcodeSchema } from '../utils/validation.js';
import { auditLogger } from '../utils/logger.js';
import logger from '../utils/logger.js';
import QRCode from 'qrcode';

const router = express.Router();

/**
 * Get all attendance today (admin only)
 */
router.get('/attendance/today', adminMiddleware, async (req, res) => {
  try {
    const { firstName } = req.user;
    
    const attendance = await sheetsService.getAllAttendanceToday();
    
    auditLogger('admin_attendance_view', firstName, { ip: req.ip }, 'success');
    
    res.json({
      success: true,
      attendance,
      count: attendance.length,
    });
  } catch (error) {
    logger.error('Error getting attendance:', error);
    auditLogger('admin_attendance_view', req.user?.firstName, { 
      error: error.message,
      ip: req.ip 
    }, 'error');
    res.status(500).json({ error: 'Erreur lors de la récupération des pointages' });
  }
});

/**
 * Get all users (admin only)
 */
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const { firstName } = req.user;
    
    const users = await sheetsService.getAllUsers();
    
    auditLogger('admin_users_view', firstName, { ip: req.ip }, 'success');
    
    res.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    auditLogger('admin_users_view', req.user?.firstName, { 
      error: error.message,
      ip: req.ip 
    }, 'error');
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

/**
 * Generate QR Code avec token sécurisé et temporaire
 * Le QR contient un token signé qui expire en 5 minutes
 * Au lieu du userID en clair
 */
router.post('/qrcode', adminMiddleware, validateSchema(qrcodeSchema), async (req, res) => {
  try {
    const { userId } = req.validatedData;
    const { firstName: adminName } = req.user;
    
    // Vérifier que l'utilisateur existe
    const user = await sheetsService.getUserData(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Générer un token signé temporaire pour le QR (5 minutes)
    const qrToken = jwt.sign(
      {
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        action: 'attendance',
      },
      process.env.QR_SECRET || 'qr-secret-change-me',
      { expiresIn: '5m' }
    );

    // URL avec token au lieu de userId
    const url = `${process.env.CLIENT_URL}/scan?token=${encodeURIComponent(qrToken)}`;
    
    // Générer le QR code
    const qrCode = await QRCode.toDataURL(url);

    auditLogger('admin_qrcode_generate', adminName, { 
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      ip: req.ip 
    }, 'success');

    res.json({
      success: true,
      qrCode,
      url: url.substring(0, 50) + '...', // Ne pas retourner l'URL complète
      expiresIn: '5 minutes',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error('Error generating QR code:', error);
    auditLogger('admin_qrcode_generate', req.user?.firstName, { 
      error: error.message,
      ip: req.ip 
    }, 'error');
    res.status(500).json({ error: 'Erreur lors de la génération du QR code' });
  }
});

/**
 * Add user (admin only)
 */
router.post('/users', adminMiddleware, validateSchema(addUserSchema), async (req, res) => {
  try {
    const userData = req.validatedData;
    const { firstName: adminName } = req.user;

    // Vérifier que l'utilisateur n'existe pas déjà
    const existing = await sheetsService.findUserByName(userData.firstName, userData.lastName);
    if (existing) {
      return res.status(409).json({ error: 'Utilisateur existe déjà' });
    }

    await sheetsService.addUser(userData);

    auditLogger('admin_user_add', adminName, { 
      userId: userData.id,
      userName: `${userData.firstName} ${userData.lastName}`,
      ip: req.ip 
    }, 'success');

    res.json({ 
      success: true, 
      message: 'Utilisateur créé avec succès',
      user: {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });
  } catch (error) {
    logger.error('Error adding user:', error);
    auditLogger('admin_user_add', req.user?.firstName, { 
      error: error.message,
      ip: req.ip 
    }, 'error');
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

/**
 * Get connected devices (admin only)
 * Retourne la liste des appareils connectés avec dernier accès et ID user-friendly
 */
router.get('/devices', adminMiddleware, async (req, res) => {
  try {
    const { firstName: adminName } = req.user;
    const deviceService = (await import('../services/deviceService.js')).default;
    const { decodeDeviceNameToIp } = await import('../utils/logger.js');
    
    // Récupérer toutes les sessions actives
    const sessions = deviceService.getActiveSessions();
    
    // Transformer pour affichage user-friendly
    const devices = sessions.map((session, index) => {
      const ipAddress = decodeDeviceNameToIp(session.deviceName) || 'Unknown';
      
      return {
        id: index + 1, // ID user-friendly: numéro simple au lieu d'IP
        name: session.deviceName,
        ipAddress: ipAddress === 'unknown' ? 'N/A' : ipAddress, // IP complète seulement si valide
        user: `${session.firstName} ${session.lastName}`,
        lastActivity: new Date(session.lastActivity).toLocaleString('fr-FR'),
        createdAt: new Date(session.createdAt).toLocaleString('fr-FR'),
        expiresAt: new Date(session.expiresAt).toLocaleString('fr-FR'),
      };
    });
    
    auditLogger('admin_devices_view', adminName, { 
      count: devices.length,
      ip: req.ip 
    }, 'success');
    
    res.json({
      success: true,
      devices,
      count: devices.length,
    });
  } catch (error) {
    logger.error('Error getting devices:', error);
    auditLogger('admin_devices_view', req.user?.firstName, { 
      error: error.message,
      ip: req.ip 
    }, 'error');
    res.status(500).json({ error: 'Erreur lors de la récupération des appareils' });
  }
});

/**
 * Get admin sessions (pour monitor les connexions)
 */
router.get('/sessions', adminMiddleware, async (req, res) => {
  try {
    const { firstName: adminName } = req.user;
    
    // Retourner un message pour l'instant (à étendre avec vraie implémentation)
    auditLogger('admin_sessions_view', adminName, { ip: req.ip }, 'success');
    
    res.json({
      success: true,
      message: 'Sessions list',
    });
  } catch (error) {
    logger.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Erreur' });
  }
});

export default router;
