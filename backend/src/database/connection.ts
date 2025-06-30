import { Pool, PoolClient } from 'pg';
import { logger } from '@/utils/logger';

let pool: Pool | null = null;

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

const getDatabaseConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'drawsql_db',
    user: process.env.DB_USER || 'drawsql_user',
    password: process.env.DB_PASSWORD || 'drawsql_password_2024!',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
  };

  // Validate required environment variables
  if (!config.host || !config.database || !config.user || !config.password) {
    throw new Error('Missing required database configuration');
  }

  return config;
};

export const connectDatabase = async (): Promise<Pool> => {
  if (pool) {
    return pool;
  }

  try {
    const config = getDatabaseConfig();
    
    pool = new Pool(config);

    // Test the connection
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      logger.info('Database connection successful:', {
        timestamp: result.rows[0]?.current_time,
        version: result.rows[0]?.pg_version?.split(' ')[0]
      });
    } finally {
      client.release();
    }

    // Handle pool errors
    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client:', err);
    });

    pool.on('connect', (client) => {
      logger.debug('New client connected to database');
    });

    pool.on('remove', (client) => {
      logger.debug('Client removed from pool');
    });

    return pool;

  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const getDatabase = (): Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    try {
      await pool.end();
      pool = null;
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw error;
    }
  }
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getDatabase().connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Query helper with logging
export const query = async (
  text: string,
  params?: any[],
  logQuery: boolean = false
): Promise<any> => {
  const start = Date.now();
  
  try {
    if (logQuery) {
      logger.debug('Executing query:', { text, params });
    }
    
    const result = await getDatabase().query(text, params);
    const duration = Date.now() - start;
    
    if (logQuery || duration > 1000) { // Log slow queries
      logger.info('Query executed:', {
        duration: `${duration}ms`,
        rows: result.rowCount,
        slow: duration > 1000
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Query failed:', {
      text,
      params,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}; 