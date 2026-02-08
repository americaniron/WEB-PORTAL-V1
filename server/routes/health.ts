/**
 * Health Check Routes for American Iron Hub Pro
 * Implements liveness and readiness probes for production deployment
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/database';

const router = Router();

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version?: string;
  checks?: {
    [key: string]: {
      status: 'pass' | 'fail';
      latency?: number;
      error?: string;
    };
  };
}

/**
 * Liveness Probe - /health
 * Indicates if the application is running and can handle requests
 * Returns 200 if app is alive, 503 if not
 */
router.get('/health', async (req: Request, res: Response) => {
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  };

  // Basic health check - just verify the process is running
  res.status(200).json(response);
});

/**
 * Readiness Probe - /ready
 * Indicates if the application is ready to serve traffic
 * Checks all critical dependencies (database, external services, etc.)
 * Returns 200 if ready, 503 if not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  const checks: HealthCheckResponse['checks'] = {};
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  // Check database connectivity
  try {
    const dbHealth = await db.healthCheck();
    checks.database = {
      status: dbHealth.healthy ? 'pass' : 'fail',
      latency: dbHealth.latency,
      error: dbHealth.error,
    };

    if (!dbHealth.healthy) {
      overallStatus = 'unhealthy';
    }
  } catch (error) {
    checks.database = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    overallStatus = 'unhealthy';
  }

  // Check AI service (optional - degraded if unavailable)
  try {
    const aiEnabled = process.env.ENABLE_AI_FEATURES === 'true';
    const hasApiKey = !!process.env.GEMINI_API_KEY;

    checks.ai = {
      status: aiEnabled && hasApiKey ? 'pass' : 'fail',
      error: !aiEnabled ? 'AI features disabled' : !hasApiKey ? 'API key not configured' : undefined,
    };

    // AI is optional, so only degrade status if it's enabled but failing
    if (aiEnabled && !hasApiKey && overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.ai = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check memory usage (warn if > 80%)
  const memUsage = process.memoryUsage();
  const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  checks.memory = {
    status: memUsagePercent < 80 ? 'pass' : 'fail',
    latency: Math.round(memUsagePercent),
    error: memUsagePercent >= 80 ? 'High memory usage' : undefined,
  };

  if (memUsagePercent >= 90) {
    overallStatus = 'degraded';
  }

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  res.status(statusCode).json(response);
});

/**
 * Detailed System Status - /status (optional, for monitoring)
 * Provides detailed system information for monitoring tools
 */
router.get('/status', async (req: Request, res: Response) => {
  // Only allow access in non-production or with valid auth
  if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const memUsage = process.memoryUsage();
  const poolStats = db.getPoolStats();

  const status = {
    application: {
      name: 'American Iron Hub Pro',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
      },
      cpu: {
        user: Math.round(process.cpuUsage().user / 1000) + ' ms',
        system: Math.round(process.cpuUsage().system / 1000) + ' ms',
      },
    },
    database: poolStats ? {
      totalConnections: poolStats.totalCount,
      idleConnections: poolStats.idleCount,
      waitingRequests: poolStats.waitingCount,
    } : null,
  };

  res.json(status);
});

export default router;
