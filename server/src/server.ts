import http from 'http';
import { Server as IOServer } from 'socket.io';
import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { initSocket } from './sockets/socket';

const httpServer = http.createServer(app);

// ── Socket.io Setup ────────────────────────────────────────────────
const io = new IOServer(httpServer, {
  cors: {
    origin: config.nodeEnv === 'production' ? config.clientUrl : true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

initSocket(io);

// ── Start Server ───────────────────────────────────────────────────
const start = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');

    httpServer.listen(config.port, () => {
      logger.info(`🚀 MedLinka API running on http://localhost:${config.port}`);
      logger.info(`📡 Socket.io listening on ws://localhost:${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (err: any) {
    logger.error(`❌ Failed to start server: ${err.message}`);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// ── Graceful Shutdown ──────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

start();
