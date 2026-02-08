/**
 * Database Connection Manager for American Iron Hub Pro
 * Implements connection pooling, health checks, and migration support
 */

import { Pool, PoolClient, QueryResult } from 'pg';

interface DatabaseConfig {
  connectionString: string;
  poolMin?: number;
  poolMax?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
}

class Database {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private isConnected: boolean = false;

  constructor() {
    this.config = {
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/american_iron_portal',
      poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
      poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMs: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '30000', 10),
      connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '5000', 10),
    };
  }

  /**
   * Initialize database connection pool
   */
  async connect(): Promise<void> {
    if (this.pool) {
      console.log('[DB] Connection pool already exists');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: this.config.connectionString,
        min: this.config.poolMin,
        max: this.config.poolMax,
        idleTimeoutMillis: this.config.idleTimeoutMs,
        connectionTimeoutMillis: this.config.connectionTimeoutMs,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      console.log('[DB] Connection pool initialized successfully');

      // Handle pool errors
      this.pool.on('error', (err) => {
        console.error('[DB] Unexpected pool error:', err);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('[DB] Failed to initialize connection pool:', error);
      this.isConnected = false;
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  /**
   * Close database connection pool
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('[DB] Connection pool closed');
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call connect() first.');
    }
    return this.pool.connect();
  }

  /**
   * Execute a query with automatic connection management
   */
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call connect() first.');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query<T>(text, params);
      return result;
    } catch (error) {
      console.error('[DB] Query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[DB] Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health check - verifies database connectivity
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    if (!this.pool || !this.isConnected) {
      return { healthy: false, error: 'Database pool not initialized' };
    }

    const startTime = Date.now();
    try {
      const result = await this.pool.query('SELECT 1 as health_check, NOW() as timestamp');
      const latency = Date.now() - startTime;
      
      if (result.rows.length > 0) {
        return { healthy: true, latency };
      }
      return { healthy: false, error: 'Invalid health check response' };
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('[DB] Health check failed:', error);
      return { 
        healthy: false, 
        latency,
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get connection pool statistics
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'employee')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Customers table
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        billing_address JSONB NOT NULL,
        shipping_address JSONB NOT NULL,
        internal_notes TEXT,
        total_billed DECIMAL(12, 2) DEFAULT 0,
        total_paid DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Leads table
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT,
        source VARCHAR(100),
        is_newsletter_subscriber BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Inventory table
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        model_number VARCHAR(100),
        serial_number VARCHAR(100),
        part_number VARCHAR(100),
        price DECIMAL(12, 2),
        cost DECIMAL(12, 2),
        quantity INTEGER NOT NULL DEFAULT 0,
        type VARCHAR(50) NOT NULL CHECK (type IN ('equipment', 'part')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Quotes table
      CREATE TABLE IF NOT EXISTS quotes (
        id VARCHAR(50) PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        quote_details JSONB NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed', 'on-hold')),
        budget DECIMAL(12, 2),
        start_date DATE NOT NULL,
        end_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Time entries table
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        user_id INTEGER REFERENCES users(id),
        date DATE NOT NULL,
        hours DECIMAL(5, 2) NOT NULL,
        description TEXT,
        is_billable BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Marketing campaigns table
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'ready', 'sending', 'sent', 'paused')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        date DATE NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        method VARCHAR(50) NOT NULL CHECK (method IN ('Credit Card', 'Bank Transfer', 'Check')),
        invoice_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Audit logs table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER,
        user_email VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
      CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
      CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
      CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_customer_id ON audit_logs(customer_id);
    `;

    try {
      await this.query(schema);
      console.log('[DB] Schema initialized successfully');
    } catch (error) {
      console.error('[DB] Schema initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    // Create migrations table if it doesn't exist
    await this.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Check which migrations have been run
    const executedMigrations = await this.query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedNames = new Set(executedMigrations.rows.map(row => row.name));

    // Define migrations
    const migrations: Array<{ name: string; up: string }> = [
      {
        name: '001_initial_schema',
        up: 'SELECT 1', // Schema is already created in initializeSchema
      },
    ];

    // Execute pending migrations
    for (const migration of migrations) {
      if (!executedNames.has(migration.name)) {
        console.log(`[DB] Running migration: ${migration.name}`);
        await this.transaction(async (client) => {
          await client.query(migration.up);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
        });
        console.log(`[DB] Migration completed: ${migration.name}`);
      }
    }
  }
}

// Export singleton instance
export const db = new Database();

export default db;
