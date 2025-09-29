"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("@/utils/logger");
const connection_1 = require("@/database/connection");
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = require("@/middleware/auth");
const socketService_1 = require("@/services/socketService");
// Import routes
const auth_2 = __importDefault(require("@/routes/auth"));
const users_1 = __importDefault(require("@/routes/users"));
const diagrams_1 = __importDefault(require("@/routes/diagrams"));
const tables_1 = __importDefault(require("@/routes/tables"));
const collaboration_1 = __importDefault(require("@/routes/collaboration"));
const templates_1 = __importDefault(require("@/routes/templates"));
const export_1 = __importDefault(require("@/routes/export"));
// Load environment variables
dotenv_1.default.config();
// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production-123456789';
    logger_1.logger.warn('JWT_SECRET not set in environment variables, using default value');
}
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});
exports.io = io;
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// API routes
app.use('/api/auth', auth_2.default);
app.use('/api/users', auth_1.authMiddleware, users_1.default);
app.use('/api/diagrams', auth_1.authMiddleware, diagrams_1.default);
app.use('/api/tables', auth_1.authMiddleware, tables_1.default);
app.use('/api/collaboration', auth_1.authMiddleware, collaboration_1.default);
app.use('/api/templates', templates_1.default); // Public templates don't need auth
app.use('/api/export', export_1.default);
// Socket.IO setup
(0, socketService_1.setupSocketHandlers)(io);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The requested route ${req.originalUrl} does not exist.`
    });
});
// Global error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close((err) => {
        if (err) {
            logger_1.logger.error('Error during server shutdown:', err);
            process.exit(1);
        }
        logger_1.logger.info('Server closed successfully');
        process.exit(0);
    });
    // Force close after 30 seconds
    setTimeout(() => {
        logger_1.logger.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 30000);
};
// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, connection_1.connectDatabase)();
        logger_1.logger.info('Database connected successfully');
        // Start HTTP server
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 DrawSQL Clone Server is running on port ${PORT}`);
            logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger_1.logger.info(`📊 Health check: http://localhost:${PORT}/health`);
            logger_1.logger.info(`🔌 WebSocket server is ready for connections`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer();
//# sourceMappingURL=index.js.map