"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.withTransaction = exports.closeDatabase = exports.getDatabase = exports.connectDatabase = void 0;
const pg_1 = require("pg");
const logger_1 = require("@/utils/logger");
let pool = null;
const getDatabaseConfig = () => {
    const config = {
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
const connectDatabase = async () => {
    if (pool) {
        return pool;
    }
    try {
        const config = getDatabaseConfig();
        pool = new pg_1.Pool(config);
        // Test the connection
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
            logger_1.logger.info('Database connection successful:', {
                timestamp: result.rows[0]?.current_time,
                version: result.rows[0]?.pg_version?.split(' ')[0]
            });
        }
        finally {
            client.release();
        }
        // Handle pool errors
        pool.on('error', (err) => {
            logger_1.logger.error('Unexpected error on idle client:', err);
        });
        pool.on('connect', (client) => {
            logger_1.logger.debug('New client connected to database');
        });
        pool.on('remove', (client) => {
            logger_1.logger.debug('Client removed from pool');
        });
        return pool;
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to database:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const getDatabase = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call connectDatabase() first.');
    }
    return pool;
};
exports.getDatabase = getDatabase;
const closeDatabase = async () => {
    if (pool) {
        try {
            await pool.end();
            pool = null;
            logger_1.logger.info('Database connection closed');
        }
        catch (error) {
            logger_1.logger.error('Error closing database connection:', error);
            throw error;
        }
    }
};
exports.closeDatabase = closeDatabase;
// Transaction helper
const withTransaction = async (callback) => {
    const client = await (0, exports.getDatabase)().connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.withTransaction = withTransaction;
// Query helper with logging
const query = async (text, params, logQuery = false) => {
    const start = Date.now();
    try {
        if (logQuery) {
            logger_1.logger.debug('Executing query:', { text, params });
        }
        const result = await (0, exports.getDatabase)().query(text, params);
        const duration = Date.now() - start;
        if (logQuery || duration > 1000) { // Log slow queries
            logger_1.logger.info('Query executed:', {
                duration: `${duration}ms`,
                rows: result.rowCount,
                slow: duration > 1000
            });
        }
        return result;
    }
    catch (error) {
        const duration = Date.now() - start;
        logger_1.logger.error('Query failed:', {
            text,
            params,
            duration: `${duration}ms`,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};
exports.query = query;
//# sourceMappingURL=connection.js.map