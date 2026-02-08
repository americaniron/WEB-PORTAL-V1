#!/usr/bin/env node
/**
 * Database Initialization Script
 * Verifies connectivity and initializes schema
 */

import { db } from '../server/db/database.js';
import { logger } from '../server/utils/logger.js';

async function initializeDatabase() {
  try {
    logger.info('Starting database initialization...');

    // Connect to database
    await db.connect();
    logger.info('✓ Database connection established');

    // Check health
    const health = await db.healthCheck();
    if (!health.healthy) {
      throw new Error(`Database health check failed: ${health.error}`);
    }
    logger.info(`✓ Database health check passed (latency: ${health.latency}ms)`);

    // Initialize schema
    await db.initializeSchema();
    logger.info('✓ Database schema initialized');

    // Run migrations
    await db.runMigrations();
    logger.info('✓ Database migrations completed');

    logger.info('Database initialization completed successfully');
    await db.disconnect();
    process.exit(0);

  } catch (error) {
    logger.error('Database initialization failed', {}, error as Error);
    process.exit(1);
  }
}

initializeDatabase();
