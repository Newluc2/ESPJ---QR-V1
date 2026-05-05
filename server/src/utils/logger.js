import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Encode IP address to base64 (reversible for device tracking)
 */
export const encodeIpToDeviceName = (ip) => {
  try {
    return `DEV-${Buffer.from(ip).toString('base64')}`;
  } catch {
    return `DEV-${Buffer.from('unknown').toString('base64')}`;
  }
};

/**
 * Decode device name back to IP address
 */
export const decodeDeviceNameToIp = (deviceName) => {
  try {
    if (!deviceName || !deviceName.startsWith('DEV-')) return null;
    const encoded = deviceName.substring(4);
    return Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return null;
  }
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'pointage-qr' },
  transports: [
    // Fichier pour les erreurs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Fichier pour tous les logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // Console pour dev
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Audit log spécifique pour les actions sensibles
export const auditLogger = (action, userId, details, status = 'success') => {
  logger.info('AUDIT', {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    status,
    ip: details?.ip,
  });
};

export default logger;
