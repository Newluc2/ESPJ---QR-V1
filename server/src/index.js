import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';

// Middlewares de sécurité
import { authMiddleware } from './middleware/auth.js';
import { 
  securityHeaders, 
  addNonce, 
  validateOrigin,
} from './middleware/security.js';
import {
  globalLimiter,
  authLimiter,
  attendanceLimiter,
  adminLimiter,
  userLimiter,
} from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const isTrustedDevelopmentOrigin = (value) => {
  try {
    const parsedUrl = new URL(value);
    const hostname = parsedUrl.hostname;

    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.github.dev') ||
      hostname.endsWith('.app.github.dev')
    );
  } catch {
    return false;
  }
};

const corsOrigin = (origin, callback) => {
  const configuredOrigin = process.env.CLIENT_URL;

  if (!origin) {
    return callback(null, true);
  }

  if (configuredOrigin && origin.startsWith(configuredOrigin)) {
    return callback(null, true);
  }

  if (isTrustedDevelopmentOrigin(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`Not allowed by CORS: ${origin}`));
};

// ============================================
// Middlewares de sécurité globaux
// ============================================

// Helmet pour les headers de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Géré manuellement pour plus de flexibilité
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'no-referrer' },
}));

// Nonce pour CSP
app.use(addNonce);

// Headers de sécurité personnalisés
app.use(securityHeaders);

// CORS avec options strictes
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
}));

// Validation Origin/Referer
app.use(validateOrigin);

// Body parser avec limite de taille
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: false }));

// Rate limiting global
app.use(globalLimiter);

// ============================================
// Routes de santé (sans authentification)
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Routes d'authentification (rate-limitées)
// ============================================

app.use('/api/auth', authLimiter, authRoutes);

// ============================================
// Routes protégées (avec authentification)
// ============================================

// Pointage
app.use('/api/attendance', attendanceLimiter, attendanceRoutes);

// Utilisateurs (avec rate limit)
app.use('/api/users', userLimiter, userRoutes);

// Admin (avec authentification admin + rate limit)
app.use('/api/admin', adminLimiter, adminRoutes);

// ============================================
// Gestion des erreurs
// ============================================

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });
  
  res.status(err.status || 500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
  });
});

// ============================================
// Démarrage du serveur
// ============================================

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
