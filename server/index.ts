/**
 * Production Express Server for American Iron Hub Pro
 * Implements security, health checks, and proper middleware configuration
 */

import express, { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { db } from './db/database';
import healthRoutes from './routes/health';
import { 
  securityHeaders, 
  cloudflareHeaders, 
  sanitizeInput, 
  getRateLimitConfig 
} from './middleware/security';
import { logger, requestLogger } from './utils/logger';

export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  trustProxy: boolean;
  corsOrigin?: string | string[];
  enableCompression: boolean;
  enableRateLimit: boolean;
}

export class ProductionServer {
  private app: Application;
  private config: ServerConfig;

  constructor() {
    this.app = express();
    this.config = this.loadConfig();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private loadConfig(): ServerConfig {
    return {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
      trustProxy: process.env.TRUST_PROXY === 'true',
      corsOrigin: process.env.CORS_ORIGIN?.split(',') || undefined,
      enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
      enableRateLimit: process.env.RATE_LIMIT_ENABLED !== 'false',
    };
  }

  private initializeMiddleware(): void {
    // Trust proxy (required for Cloudflare and reverse proxies)
    if (this.config.trustProxy) {
      this.app.set('trust proxy', 1);
      logger.info('Proxy trust enabled');
    }

    // Cloudflare compatibility
    this.app.use(cloudflareHeaders);

    // Security headers with Helmet
    this.app.use(helmet({
      contentSecurityPolicy: false, // We use custom CSP
      hsts: {
        maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
        includeSubDomains: true,
        preload: true,
      },
    }));

    // Custom security headers
    this.app.use(securityHeaders({
      trustProxy: this.config.trustProxy,
      cspEnabled: process.env.CSP_ENABLED !== 'false',
      hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
      corsOrigin: this.config.corsOrigin,
      corsCredentials: process.env.CORS_CREDENTIALS === 'true',
    }));

    // CORS configuration
    const corsOptions: cors.CorsOptions = {
      origin: this.config.corsOrigin || false,
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
      maxAge: 86400, // 24 hours
    };
    this.app.use(cors(corsOptions));

    // Compression (gzip/brotli)
    if (this.config.enableCompression) {
      this.app.use(compression({
        threshold: 1024, // Only compress responses > 1KB
        level: 6, // Default compression level
      }));
    }

    // Body parsing with size limits
    const bodySizeLimit = process.env.BODY_SIZE_LIMIT || '10mb';
    this.app.use(express.json({ limit: bodySizeLimit }));
    this.app.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));

    // Request logging
    this.app.use(requestLogger);

    // Input sanitization
    this.app.use(sanitizeInput);

    // Rate limiting
    if (this.config.enableRateLimit) {
      // General rate limiter
      const generalLimiter = rateLimit(getRateLimitConfig('general'));
      this.app.use(generalLimiter);

      // Auth endpoint rate limiter (stricter)
      const authLimiter = rateLimit(getRateLimitConfig('auth'));
      this.app.use('/api/auth', authLimiter);

      logger.info('Rate limiting enabled');
    }
  }

  private initializeRoutes(): void {
    // Health check routes (no auth required)
    this.app.use(healthRoutes);

    // API routes would go here
    // this.app.use('/api', apiRoutes);

    // Serve static files (frontend)
    if (this.config.nodeEnv === 'production') {
      this.app.use(express.static('dist', {
        maxAge: '1y',
        etag: true,
        lastModified: true,
      }));

      // SPA fallback - all non-API routes serve index.html
      this.app.get('*', (req: Request, res: Response) => {
        res.sendFile('index.html', { root: 'dist' });
      });
    }
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
        path: req.path,
      });
    });

    // Global error handler
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      }, err);

      // Don't leak error details in production
      const isDevelopment = this.config.nodeEnv === 'development';

      res.status((err as any).status || 500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? err.message : 'An unexpected error occurred',
        ...(isDevelopment && { stack: err.stack }),
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      logger.info('Initializing database connection...');
      await db.connect();
      
      // Run migrations if in production
      if (this.config.nodeEnv === 'production') {
        logger.info('Running database migrations...');
        await db.initializeSchema();
        await db.runMigrations();
      }

      // Start server
      const server = this.app.listen(this.config.port, this.config.host, () => {
        logger.info('Server started successfully', {
          port: this.config.port,
          host: this.config.host,
          environment: this.config.nodeEnv,
          nodeVersion: process.version,
        });
      });

      // Set server timeouts
      const timeoutMs = parseInt(process.env.SERVER_TIMEOUT_MS || '30000', 10);
      server.setTimeout(timeoutMs);

      // Graceful shutdown
      const gracefulShutdown = async (signal: string) => {
        logger.info(`Received ${signal}, starting graceful shutdown`);

        server.close(async () => {
          logger.info('HTTP server closed');

          try {
            await db.disconnect();
            logger.info('Database connections closed');
            process.exit(0);
          } catch (error) {
            logger.error('Error during graceful shutdown', {}, error as Error);
            process.exit(1);
          }
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
          logger.error('Forced shutdown after timeout');
          process.exit(1);
        }, 10000);
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      // Handle uncaught exceptions
      process.on('uncaughtException', (error: Error) => {
        logger.error('Uncaught exception', {}, error);
        gracefulShutdown('uncaughtException');
      });

      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason: any) => {
        logger.error('Unhandled promise rejection', { reason });
        gracefulShutdown('unhandledRejection');
      });

    } catch (error) {
      logger.error('Failed to start server', {}, error as Error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Start server if this file is executed directly
if (require.main === module) {
  const server = new ProductionServer();
  server.start();
}

export default ProductionServer;
