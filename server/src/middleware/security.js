import crypto from 'crypto';

/**
 * Middleware pour ajouter les headers de sécurité standards
 */
export const securityHeaders = (req, res, next) => {
  // Prévenir le clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prévenir le MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Activer XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy strict
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'nonce-" + res.locals.nonce + "'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "form-action 'self'; " +
    "base-uri 'self'; " +
    "upgrade-insecure-requests;"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};

/**
 * Middleware pour générer un nonce CSP
 */
export const addNonce = (req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('hex');
  next();
};

/**
 * Middleware pour validation du header Referer/Origin (anti-CSRF basique)
 */
export const validateOrigin = (req, res, next) => {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);

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
  
  const origin = req.headers.origin || req.headers.referer;
  
  // Pour les requests POST/PUT/DELETE sans origin/referer, refuser
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (!origin) {
      return res.status(403).json({ error: 'Requête refusée' });
    }
    
    const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed)) || isTrustedDevelopmentOrigin(origin);
    
    if (!isAllowed) {
      console.warn(`Cross-origin request from unauthorized origin: ${origin}`);
      return res.status(403).json({ error: 'Requête refusée' });
    }
  }
  
  next();
};

/**
 * Middleware pour ajouter le SameSite cookie attribute
 * (géré à travers express-session)
 */
export const sameSiteCookie = {
  sameSite: 'Strict',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
};
