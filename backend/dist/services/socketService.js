"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const logger_1 = require("../utils/logger");
const setupSocketHandlers = (io) => {
    logger_1.logger.info('Setting up Socket.IO handlers...');
    io.on('connection', (socket) => {
        logger_1.logger.info(`Socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            logger_1.logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
    logger_1.logger.info('Socket.IO handlers setup complete');
};
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=socketService.js.map