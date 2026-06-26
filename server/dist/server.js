"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const socket_1 = require("./sockets/socket");
const httpServer = http_1.default.createServer(app_1.default);
// ── Socket.io Setup ────────────────────────────────────────────────
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_1.config.nodeEnv === 'production' ? env_1.config.clientUrl : true,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});
(0, socket_1.initSocket)(io);
// ── Start Server ───────────────────────────────────────────────────
const start = async () => {
    try {
        await database_1.prisma.$connect();
        logger_1.logger.info('✅ Database connected');
        httpServer.listen(env_1.config.port, () => {
            logger_1.logger.info(`🚀 MedLinka API running on http://localhost:${env_1.config.port}`);
            logger_1.logger.info(`📡 Socket.io listening on ws://localhost:${env_1.config.port}`);
            logger_1.logger.info(`🌍 Environment: ${env_1.config.nodeEnv}`);
        });
    }
    catch (err) {
        logger_1.logger.error(`❌ Failed to start server: ${err.message}`);
        await database_1.prisma.$disconnect();
        process.exit(1);
    }
};
// ── Graceful Shutdown ──────────────────────────────────────────────
const shutdown = async (signal) => {
    logger_1.logger.info(`${signal} received — shutting down gracefully`);
    httpServer.close(async () => {
        await database_1.prisma.$disconnect();
        logger_1.logger.info('Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});
start();
//# sourceMappingURL=server.js.map