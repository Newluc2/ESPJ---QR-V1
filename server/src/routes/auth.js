import express from 'express';
import { validateSchema } from '../middleware/validation.js';
import { loginSchema } from '../schemas/auth.js';
import deviceService from '../services/deviceService.js';
import sheetsService from '../services/sheetsService.js';
import { logger, auditLogger } from '../services/logger.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Login endpoint - Authentifier un utilisateur via prénom/nom
 * Retourne un token de device complexe pour pairing d'appareil
 */
router.post('/login', authLimiter, validateSchema(loginSchema), async (req, res) => {
  try {
    const { firstName, lastName } = req.validatedData;
    const { encodeIpToDeviceName } = await import('../utils/logger.js');
    const deviceName = encodeIpToDeviceName(req.ip);
    
    logger.info('Login attempt', {
      firstName,
      lastName: lastName.charAt(0) + '*'.repeat(lastName.length - 1),
      deviceName,
      ip: req.ip,
    });

    // Vérifier que l'utilisateur existe dans Google Sheets
    const user = await sheetsService.findUserByName(firstName, lastName);
    
    if (!user) {
      logger.warn('Login failed: user not found', { firstName, lastName, ip: req.ip });
      auditLogger('login_user_not_found', `${firstName} ${lastName}`, { ip: req.ip }, 'failed');
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Générer un token de device complexe et non-devinable
    const deviceToken = deviceService.generateDeviceToken(firstName, lastName);
    
    // Enregistrer la session et le device
    const registration = deviceService.registerDevice(
      deviceToken,
      firstName,
      lastName,
      deviceName
    );

    if (!registration.success) {
      logger.error('Device registration failed', registration);
      return res.status(500).json({ error: 'Erreur lors de la connexion' });
    }

    auditLogger('login_success', `${firstName} ${lastName}`, { 
      deviceName,
      ip: req.ip,
      sessionId: registration.sessionId,
    }, 'success');

    // Stocker sessionId en cookie HttpOnly sécurisé
    res.cookie('sessionId', registration.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Retourner le token de device et les infos
    res.json({
      success: true,
      deviceToken,
      user: {
        firstName,
        lastName,
      },
      expiresAt: registration.expiresAt,
      message: 'Connexion réussie',
    });
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      ip: req.ip,
    });
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

/**
 * Verify token - Vérifier que le token de device est valide
 */
router.post('/verify', validateSchema({ type: 'object', properties: { deviceToken: { type: 'string' } } }), async (req, res) => {
  try {
    const { deviceToken } = req.validatedData;
    
    const verification = deviceService.verifyDeviceToken(deviceToken);
    
    if (!verification.valid) {
      logger.warn('Token verification failed', { ip: req.ip });
      return res.status(401).json({ valid: false, error: 'Token invalide ou expiré' });
    }

    res.json({
      valid: true,
      user: verification.user,
      expiresAt: verification.expiresAt,
    });
  } catch (error) {
    logger.error('Verify error', { error: error.message, ip: req.ip });
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

/**
 * Logout endpoint - Invalider le token de device
 */
router.post('/logout', validateSchema({ type: 'object', properties: { deviceToken: { type: 'string' } } }), async (req, res) => {
  try {
    const { deviceToken } = req.validatedData;
    
    deviceService.invalidateDeviceToken(deviceToken);
    
    auditLogger('logout', 'Unknown', { ip: req.ip }, 'success');
    
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    logger.error('Logout error', { error: error.message, ip: req.ip });
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

/**
 * Admin login - Authentifier l'admin par mot de passe uniquement
 * Retourne un deviceToken spécial marqué comme admin
 */
router.post('/admin-login', authLimiter, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      logger.warn('Admin login failed: missing password', { ip: req.ip });
      auditLogger('admin_login_failed', 'unknown', { reason: 'missing_password', ip: req.ip }, 'failed');
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    if (password !== adminPassword) {
      logger.warn('Admin login failed: invalid password', { ip: req.ip });
      auditLogger('admin_login_failed', 'unknown', { reason: 'invalid_password', ip: req.ip }, 'failed');
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Importer la fonction d'encodage d'IP
    const { encodeIpToDeviceName } = await import('../utils/logger.js');
    const deviceName = encodeIpToDeviceName(req.ip);

    // Générer un device token marqué comme admin
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const deviceToken = deviceService.generateDeviceToken(adminName, 'Admin');
    
    const registration = deviceService.registerDevice(
      deviceToken,
      adminName,
      'Admin',
      deviceName
    );

    if (!registration.success) {
      logger.error('Admin device registration failed', registration);
      return res.status(500).json({ error: 'Erreur lors de la connexion' });
    }

    auditLogger('admin_login_success', adminName, { 
      deviceName: registration.sessionId,
      ip: req.ip,
    }, 'success');

    res.cookie('sessionId', registration.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      deviceToken,
      user: {
        firstName: adminName,
        lastName: 'Admin',
      },
      expiresAt: registration.expiresAt,
      message: 'Connexion admin réussie',
    });
  } catch (error) {
    logger.error('Admin login error', {
      error: error.message,
      ip: req.ip,
    });
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

export default router;
