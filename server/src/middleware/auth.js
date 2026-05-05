import deviceService from '../services/deviceService.js';
import { auditLogger } from '../utils/logger.js';

/**
 * Authentifier via device token (dans le header Authorization Bearer)
 * Remplace le JWT
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const deviceToken = authHeader.slice(7); // Enlever "Bearer "
    const verification = deviceService.verifyDeviceToken(deviceToken);
    
    if (!verification.valid) {
      auditLogger('auth_failed', 'unknown', { ip: req.ip }, 'failed');
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
    
    req.user = verification.user;
    req.sessionId = verification.sessionId;
    req.deviceToken = deviceToken;
    next();
  } catch (error) {
    auditLogger('auth_error', 'unknown', { error: error.message, ip: req.ip }, 'error');
    return res.status(401).json({ error: 'Erreur d\'authentification' });
  }
};

/**
 * Vérifier les permissions admin
 * Actuellement check si firstName === ADMIN_NAME (peut être étendu)
 */
export const adminMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentification admin requise' });
    }

    const deviceToken = authHeader.slice(7);
    const verification = deviceService.verifyDeviceToken(deviceToken);
    
    if (!verification.valid) {
      auditLogger('admin_auth_failed', 'unknown', { ip: req.ip }, 'failed');
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
    
    // Vérifier les permissions admin
    const adminName = process.env.ADMIN_NAME || 'Admin';
    if (verification.user.firstName !== adminName) {
      auditLogger('admin_access_denied', verification.user.firstName, { ip: req.ip }, 'denied');
      return res.status(403).json({ error: 'Accès admin requis' });
    }
    
    req.user = verification.user;
    req.sessionId = verification.sessionId;
    req.deviceToken = deviceToken;
    next();
  } catch (error) {
    auditLogger('admin_auth_error', 'unknown', { error: error.message, ip: req.ip }, 'error');
    return res.status(401).json({ error: 'Erreur d\'authentification admin' });
  }
};
