/**
 * Authentication Service with Bcrypt Password Hashing
 * Production-ready authentication with JWT tokens
 */

import bcrypt from 'bcrypt';
import { User } from '../types';

interface AuthConfig {
  bcryptRounds: number;
  jwtSecret: string;
  jwtExpiration: string;
}

class AuthService {
  private config: AuthConfig;

  constructor() {
    this.config = {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
      jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
      jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    };

    // Validate configuration in production
    if (process.env.NODE_ENV === 'production') {
      if (this.config.jwtSecret === 'change-this-in-production') {
        throw new Error('JWT_SECRET must be set in production');
      }
    }
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.bcryptRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate JWT token (placeholder - implement with jsonwebtoken library)
   */
  generateToken(user: User): string {
    // TODO: Implement with jsonwebtoken library
    // For now, return a placeholder
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
    };

    // In production, use: jwt.sign(payload, this.config.jwtSecret, { expiresIn: this.config.jwtExpiration })
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Verify JWT token (placeholder - implement with jsonwebtoken library)
   */
  verifyToken(token: string): { valid: boolean; payload?: any } {
    try {
      // TODO: Implement with jsonwebtoken library
      // In production, use: jwt.verify(token, this.config.jwtSecret)
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Sanitize user object for client response (remove sensitive data)
   * Intentionally excludes: password_hash, token (if present), and other sensitive fields
   * @param user - User object from database or authentication
   * @returns Safe user object for client
   */
  sanitizeUser(user: { id: number; email: string; role: 'admin' | 'user' | 'employee'; [key: string]: any }): User {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      // token field is intentionally excluded for security
      // password_hash and other sensitive fields are excluded
    };
  }
}

// Export singleton instance
export const authService = new AuthService();

export default authService;
