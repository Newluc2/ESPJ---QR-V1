import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../../logs');

// Créer le répertoire logs s'il n'existe pas
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Logger simple centralisé
 */
export const logger = {
  info(message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...data,
    };
    console.log(JSON.stringify(log));
    writeLog(log);
  },

  warn(message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...data,
    };
    console.warn(JSON.stringify(log));
    writeLog(log);
  },

  error(message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      ...data,
    };
    console.error(JSON.stringify(log));
    writeLog(log);
  },

  debug(message, data = {}) {
    if (process.env.DEBUG === 'true') {
      const log = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        ...data,
      };
      console.log(JSON.stringify(log));
      writeLog(log);
    }
  },
};

/**
 * Audit logger - trace toutes les actions sensibles
 */
export const auditLogger = (action, user, context = {}, status = 'unknown') => {
  const log = {
    timestamp: new Date().toISOString(),
    type: 'AUDIT',
    action,
    user,
    status,
    context,
  };
  
  console.log(JSON.stringify(log));
  writeAuditLog(log);
};

/**
 * Écrire dans les logs applicatifs
 */
function writeLog(log) {
  try {
    const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(log) + '\n', 'utf8');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

/**
 * Écrire dans les logs d'audit
 */
function writeAuditLog(log) {
  try {
    const auditFile = path.join(logsDir, `audit-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(auditFile, JSON.stringify(log) + '\n', 'utf8');
  } catch (error) {
    console.error('Error writing to audit log file:', error);
  }
}

export default logger;
