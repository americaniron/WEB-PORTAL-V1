#!/usr/bin/env node
/**
 * Database Migration Script
 * Runs pending database migrations
 */

import { db } from '../server/db/database.js';
import { logger } from '../server/utils/logger.js';

async function runMigrations() {
  try {
    logger.info('Starting database migration...');

    // Connect to database
    await db.connect();
    logger.info('✓ Connected to database');

    // Run migrations
    await db.runMigrations();
    logger.info('✓ Migrations completed successfully');

    await db.disconnect();
    process.exit(0);

  } catch (error) {
    logger.error('Migration failed', {}, error as Error);
    process.exit(1);
  }
}

runMigrations();
