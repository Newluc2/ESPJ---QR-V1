import rateLimit from 'express-rate-limit';
import { auditLogger } from '../services/logger.js';

/**
 * Rate limiter global : 100 requêtes par 15 minutes
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Ne pas limiter les requetes de health check
    return req.path === '/api/health';
  },
  handler: (req, res) => {
    auditLogger('rate_limit_exceeded', 'unknown', { 
      path: req.path, 
      ip: req.ip 
    }, 'blocked');
    res.status(429).json({
      error: 'Trop de requêtes',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Rate limiter strict pour l'authentification : 5 tentatives par 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard',
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    auditLogger('auth_rate_limit_exceeded', 'unknown', { 
      firstName: req.body?.firstName,
      ip: req.ip 
    }, 'blocked');
    res.status(429).json({
      error: 'Trop de tentatives. Compte temporairement bloqué.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Rate limiter pour les endpoints de pointage : 10 par minute
 */
export const attendanceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Trop de pointages, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    auditLogger('attendance_rate_limit_exceeded', req.user?.firstName || 'unknown', { 
      ip: req.ip 
    }, 'blocked');
    res.status(429).json({
      error: 'Trop de pointages en peu de temps. Veuillez réessayer plus tard.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Rate limiter pour les endpoints admin : 50 par 15 minutes
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Limite atteinte pour les opérations admin',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    auditLogger('admin_rate_limit_exceeded', req.user?.firstName || 'unknown', { 
      path: req.path,
      ip: req.ip 
    }, 'blocked');
    res.status(429).json({
      error: 'Limite atteinte',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Rate limiter pour les requêtes d'utilisateurs : 30 par minute
 */
export const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Trop de requêtes utilisateur',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    auditLogger('user_rate_limit_exceeded', req.user?.firstName || 'unknown', { 
      ip: req.ip 
    }, 'blocked');
    res.status(429).json({
      error: 'Trop de requêtes. Veuillez réessayer plus tard.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Rate limiter stricte pour les requêtes d'énumération (prévention d'énumération)
 * 5 erreurs 404 par 10 minutes par IP
 */
export const enumerationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Trop de recherches infructueuses',
  skipSuccessfulRequests: true, // Compter uniquement les 404
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Limiter par IP pour l'énumération
    return req.ip;
  },
  handler: (req, res) => {
    auditLogger('enumeration_attempt', 'unknown', { 
      path: req.path,
      ip: req.ip 
    }, 'blocked');
    res.status(429).json({
      error: 'Trop de recherches. Veuillez réessayer plus tard.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});
