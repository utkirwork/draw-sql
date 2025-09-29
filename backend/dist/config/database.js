"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.testConnection = exports.pool = void 0;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'drawsql_clone',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
};
exports.pool = new pg_1.Pool(config);
// Test database connection
const testConnection = async () => {
    try {
        const client = await exports.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger_1.logger.info('Database connection successful');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Database connection failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
// Graceful shutdown
const closeConnection = async () => {
    try {
        await exports.pool.end();
        logger_1.logger.info('Database connection pool closed');
    }
    catch (error) {
        logger_1.logger.error('Error closing database connection:', error);
    }
};
exports.closeConnection = closeConnection;
// Handle process termination
process.on('SIGINT', exports.closeConnection);
process.on('SIGTERM', exports.closeConnection);
//# sourceMappingURL=database.js.map