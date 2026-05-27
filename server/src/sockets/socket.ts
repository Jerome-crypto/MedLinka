import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

let io: IOServer;

export const initSocket = (server: IOServer) => {
  io = server;

  // JWT handshake auth — also extract hospitalId so hospital_admin can join the right room
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        id: string;
        role: string;
        hospitalId?: string | null;
        providerId?: string | null;
      };
      (socket as any).userId = payload.id;
      (socket as any).userRole = payload.role;
      (socket as any).hospitalId = payload.hospitalId ?? null;
      (socket as any).providerId = payload.providerId ?? null;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId as string;
    const userRole = (socket as any).userRole as string;

    logger.info(`Socket connected: ${userId} (${userRole}) [${socket.id}]`);

    // Personal room — receives all notifications for this user
    socket.join(`user:${userId}`);

    // Join hospital room if hospital_admin — use JWT-embedded hospitalId for targeted events
    if (userRole === 'hospital_admin') {
      const hospitalId: string | null = (socket as any).hospitalId;
      if (hospitalId) {
        socket.join(`hospital:${hospitalId}`);
        logger.debug(`Hospital admin ${userId} joined room: hospital:${hospitalId}`);
      } else {
        // Fallback: look up via ambulance assignment if hospitalId was not in the token
        const amb = await prisma.ambulance.findFirst({
          where: { driverId: userId },
          select: { assignedHospitalId: true },
        });
        if (amb?.assignedHospitalId) {
          socket.join(`hospital:${amb.assignedHospitalId}`);
          logger.debug(`Hospital admin ${userId} joined room (fallback): hospital:${amb.assignedHospitalId}`);
        } else {
          // Last resort: join all hospitals so they at least get some notifications
          socket.join('hospital:all');
          logger.warn(`Hospital admin ${userId} joined hospital:all (no assignedHospitalId found)`);
        }
      }
    }

    // Join provider room if provider_manager
    if (userRole === 'provider_manager') {
      const providerId: string | null = (socket as any).providerId;
      if (providerId) {
        socket.join(`provider:${providerId}`);
        logger.debug(`Provider manager ${userId} joined room: provider:${providerId}`);
      }
    }

    // ── Driver: join active request room ──────────────────────────
    socket.on('driver:joinRequest', (requestId: string) => {
      socket.join(`request:${requestId}`);
      logger.debug(`Driver ${userId} joined request room: ${requestId}`);
    });

    // ── Driver: stream GPS location ───────────────────────────────
    socket.on('driver:location', async (data: {
      ambulanceId: string;
      lat: number;
      lng: number;
      requestId?: string;
    }) => {
      try {
        await prisma.ambulance.update({
          where: { id: data.ambulanceId },
          data: { lat: data.lat, lng: data.lng },
        });

        if (data.requestId) {
          await prisma.locationLog.create({
            data: {
              ambulanceId: data.ambulanceId,
              lat: data.lat,
              lng: data.lng,
              requestId: data.requestId,
            },
          });

          // Broadcast to citizen tracking this request
          socket.to(`request:${data.requestId}`).emit('ambulance:locationUpdate', {
            ambulanceId: data.ambulanceId,
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date(),
          });
        }
      } catch (err: any) {
        logger.error(`driver:location error: ${err.message}`);
      }
    });

    // ── Citizen: join their request room ──────────────────────────
    socket.on('citizen:trackRequest', (requestId: string) => {
      socket.join(`request:${requestId}`);
      logger.debug(`Citizen ${userId} joined tracking room: ${requestId}`);
    });

    // ── Hospital admin: join specific hospital room ────────────────
    socket.on('hospital:join', (hospitalId: string) => {
      socket.join(`hospital:${hospitalId}`);
      logger.debug(`Hospital admin joined room: hospital:${hospitalId}`);
    });

    // ── Disconnect ─────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${userId} — ${reason}`);
    });
  });

  logger.info('Socket.io initialised');
};

/** Get IO instance (for use in services) */
export const getIO = (): IOServer => {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
};
