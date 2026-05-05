import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

class DeviceService {
  constructor() {
    // Stockage en-mémoire temporaire (à remplacer par cache Redis en production)
    this.devices = new Map();
    this.activeSessions = new Map();
    
    // Nettoyage des sessions expirées toutes les heures
    setInterval(() => this.cleanExpiredSessions(), 3600000);
  }

  /**
   * Générer un token de device complexe
   * Format: UUID + hash(timestamp + secret) + checksum
   */
  generateDeviceToken(firstName, lastName) {
    const uuid = uuidv4();
    const timestamp = Date.now();
    const secret = process.env.DEVICE_SECRET || 'default-secret-change-me';
    
    // Créer un token complexe non-devinable
    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${uuid}${timestamp}${firstName}${lastName}`)
      .digest('hex');
    
    // Token final: UUID + hash + timestamp (chiffré en hex)
    const deviceToken = `${uuid}.${hash}.${timestamp.toString(36)}`;
    
    return deviceToken;
  }

  /**
   * Valider et enregistrer un device
   */
  registerDevice(deviceToken, firstName, lastName, deviceName = null) {
    try {
      // Vérifier la structure du token
      const parts = deviceToken.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');
      
      const [uuid, hash, timestampStr] = parts;
      const timestamp = parseInt(timestampStr, 36);
      
      // Vérifier la fraîcheur du token (max 1 heure)
      if (Date.now() - timestamp > 3600000) {
        return { success: false, error: 'Token expiré' };
      }
      
      // Vérifier le hash
      const secret = process.env.DEVICE_SECRET || 'default-secret-change-me';
      const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(`${uuid}${timestamp}${firstName}${lastName}`)
        .digest('hex');
      
      if (hash !== expectedHash) {
        return { success: false, error: 'Token invalide' };
      }
      
      // Enregistrer et créer une session
      const sessionId = uuidv4();
      const expiresAt = Date.now() + (24 * 3600000); // 24h
      
      const sessionData = {
        deviceToken,
        sessionId,
        firstName,
        lastName,
        deviceName: deviceName || `Device-${uuid.substring(0, 8)}`,
        createdAt: Date.now(),
        expiresAt,
        lastActivity: Date.now(),
      };
      
      // Stocker la session
      this.activeSessions.set(sessionId, sessionData);
      this.devices.set(deviceToken, sessionData);
      
      return {
        success: true,
        sessionId,
        expiresAt,
        user: {
          firstName,
          lastName,
        },
      };
    } catch (error) {
      return { success: false, error: 'Token validation failed' };
    }
  }

  /**
   * Vérifier une session active
   */
  verifySession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return { valid: false };
    }
    
    // Vérifier l'expiration
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(sessionId);
      this.devices.delete(session.deviceToken);
      return { valid: false };
    }
    
    // Mettre à jour la dernière activité
    session.lastActivity = Date.now();
    
    return {
      valid: true,
      user: {
        firstName: session.firstName,
        lastName: session.lastName,
        deviceName: session.deviceName,
      },
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Vérifier un token de device
   */
  verifyDeviceToken(deviceToken) {
    const session = this.devices.get(deviceToken);
    
    if (!session) {
      return { valid: false };
    }
    
    // Vérifier l'expiration
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(session.sessionId);
      this.devices.delete(deviceToken);
      return { valid: false };
    }
    
    // Mettre à jour la dernière activité
    session.lastActivity = Date.now();
    
    return {
      valid: true,
      sessionId: session.sessionId,
      user: {
        firstName: session.firstName,
        lastName: session.lastName,
      },
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Invalider une session (logout)
   */
  invalidateSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.devices.delete(session.deviceToken);
    }
    this.activeSessions.delete(sessionId);
    return { success: true };
  }

  /**
   * Invalider un token de device
   */
  invalidateDeviceToken(deviceToken) {
    const session = this.devices.get(deviceToken);
    if (session) {
      this.activeSessions.delete(session.sessionId);
    }
    this.devices.delete(deviceToken);
    return { success: true };
  }

  /**
   * Nettoyer les sessions expirées
   */
  cleanExpiredSessions() {
    const now = Date.now();
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now > session.expiresAt) {
        this.devices.delete(session.deviceToken);
        this.activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Obtenir toutes les sessions actives
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Obtenir une session spécifique
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }
}

export default new DeviceService();
