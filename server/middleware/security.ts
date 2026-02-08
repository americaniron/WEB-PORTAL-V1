/**
 * Security Middleware for American Iron Hub Pro
 * Implements comprehensive security headers and protections for production deployment
 */

import { Request, Response, NextFunction } from 'express';

interface SecurityConfig {
  trustProxy: boolean;
  cspEnabled: boolean;
  hstsMaxAge: number;
  corsOrigin?: string | string[];
  corsCredentials: boolean;
}

/**
 * Security Headers Middleware
 * Implements OWASP recommended security headers
 */
export function securityHeaders(config: SecurityConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Content Security Policy
    if (config.cspEnabled) {
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for React/Vite
        "style-src 'self' 'unsafe-inline'", // Required for inline styles
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://generativelanguage.googleapis.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ');
      res.setHeader('Content-Security-Policy', csp);
    }

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Enable browser XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Restrict browser features and APIs
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // HTTP Strict Transport Security (HSTS) - only when behind HTTPS
    if (config.hstsMaxAge > 0 && (req.secure || req.headers['x-forwarded-proto'] === 'https')) {
      res.setHeader(
        'Strict-Transport-Security',
        `max-age=${config.hstsMaxAge}; includeSubDomains; preload`
      );
    }

    // Prevent caching of sensitive data
    if (req.path.includes('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  };
}

/**
 * Cloudflare Compatibility Middleware
 * Handles Cloudflare-specific headers and proxy configuration
 */
export function cloudflareHeaders(req: Request, res: Response, next: NextFunction) {
  // Extract real client IP from Cloudflare headers
  const cfConnectingIp = req.headers['cf-connecting-ip'] as string;
  const trueClientIp = req.headers['true-client-ip'] as string;
  const xForwardedFor = req.headers['x-forwarded-for'] as string;

  // Set the real IP for logging and rate limiting
  if (cfConnectingIp) {
    req.ip = cfConnectingIp;
  } else if (trueClientIp) {
    req.ip = trueClientIp;
  } else if (xForwardedFor) {
    req.ip = xForwardedFor.split(',')[0].trim();
  }

  // Handle Cloudflare's X-Forwarded-Proto for HTTPS detection
  const cfProto = req.headers['x-forwarded-proto'] as string;
  if (cfProto === 'https') {
    req.secure = true;
    req.protocol = 'https';
  }

  // Add Cloudflare-specific security headers
  res.setHeader('X-Powered-By', 'American Iron Hub Pro'); // Replace default

  next();
}

/**
 * Request Sanitization Middleware
 * Prevents common injection attacks
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize body (for JSON requests)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
}

/**
 * Deep sanitize an object to prevent XSS and injection attacks
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;

  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * CSRF Protection Middleware
 * Implements token-based CSRF protection
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for /health and /ready endpoints
  if (['/health', '/ready'].includes(req.path)) {
    return next();
  }

  // In production, verify CSRF token
  // This is a simplified version - use a proper CSRF library like csurf in production
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

  if (process.env.NODE_ENV === 'production' && (!csrfToken || csrfToken !== sessionToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

/**
 * Rate Limiting Configuration
 * Returns rate limiter options based on endpoint type
 */
export function getRateLimitConfig(type: 'auth' | 'api' | 'general') {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes

  const configs = {
    auth: {
      windowMs,
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10),
      message: 'Too many authentication attempts. Please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    api: {
      windowMs,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      message: 'Too many requests. Please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    general: {
      windowMs,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10) * 2,
      standardHeaders: true,
      legacyHeaders: false,
    },
  };

  return configs[type];
}

/**
 * SSRF Protection Middleware
 * Prevents Server-Side Request Forgery attacks
 */
export function ssrfProtection(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Block private IP ranges
    const privateRanges = [
      /^127\./,  // 127.0.0.0/8
      /^10\./,   // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12
      /^192\.168\./,  // 192.168.0.0/16
      /^169\.254\./,  // 169.254.0.0/16 (link-local)
      /^::1$/,   // IPv6 loopback
      /^fe80:/,  // IPv6 link-local
      /^fc00:/,  // IPv6 unique local
    ];

    const hostname = parsed.hostname;

    // Check for blocked hostnames
    if (hostname === 'localhost' || hostname.endsWith('.local')) {
      return false;
    }

    // Check for private IP ranges
    for (const range of privateRanges) {
      if (range.test(hostname)) {
        return false;
      }
    }

    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Input Validation Helpers
 */
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  password: (password: string): boolean => {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password) && password.length <= 128;
  },

  alphanumeric: (str: string): boolean => {
    return /^[a-zA-Z0-9_-]+$/.test(str);
  },

  phoneNumber: (phone: string): boolean => {
    // International phone number format
    return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s()-]/g, ''));
  },
};

export default {
  securityHeaders,
  cloudflareHeaders,
  sanitizeInput,
  csrfProtection,
  getRateLimitConfig,
  ssrfProtection,
  validators,
};
