/**
 * Structured Logging Utility for American Iron Hub Pro
 * Production-grade logging with security considerations
 */

enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private level: LogLevel;
  private enableRequestLogging: boolean;

  constructor() {
    const configLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    this.level = this.parseLogLevel(configLevel);
    this.enableRequestLogging = process.env.ENABLE_REQUEST_LOGGING !== 'false';
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'apikey', 'authorization', 'cookie'];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private formatLog(entry: LogEntry): string {
    const sanitizedEntry = {
      ...entry,
      context: entry.context ? this.sanitize(entry.context) : undefined,
    };

    return JSON.stringify(sanitizedEntry);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? this.sanitize(context) : undefined,
      error: error ? {
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        code: (error as any).code,
      } : undefined,
    };

    const logString = this.formatLog(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(logString);
        break;
      case LogLevel.WARN:
        console.warn(logString);
        break;
      case LogLevel.DEBUG:
        console.debug(logString);
        break;
      default:
        console.log(logString);
    }
  }

  public error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log HTTP request
   */
  public request(req: any, res: any, duration: number): void {
    if (!this.enableRequestLogging) {
      return;
    }

    const sanitizedHeaders = this.sanitize(req.headers);

    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      headers: process.env.NODE_ENV !== 'production' ? sanitizedHeaders : undefined,
    });
  }

  /**
   * Log security event
   */
  public security(message: string, context?: Record<string, any>): void {
    this.warn(`[SECURITY] ${message}`, context);
  }

  /**
   * Log audit event
   */
  public audit(action: string, userId: string, details: Record<string, any>): void {
    this.info('[AUDIT]', {
      action,
      userId,
      details: this.sanitize(details),
    });
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Express middleware for request logging
 */
export function requestLogger(req: any, res: any, next: any): void {
  const startTime = Date.now();

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.request(req, res, duration);
  });

  next();
}

export default logger;
