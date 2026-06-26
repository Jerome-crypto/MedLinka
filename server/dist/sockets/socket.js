"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
let io;
const initSocket = (server) => {
    io = server;
    // JWT handshake auth — also extract hospitalId so hospital_admin can join the right room
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
            socket.userId = payload.id;
            socket.userRole = payload.role;
            socket.hospitalId = payload.hospitalId ?? null;
            socket.providerId = payload.providerId ?? null;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', async (socket) => {
        const userId = socket.userId;
        const userRole = socket.userRole;
        logger_1.logger.info(`Socket connected: ${userId} (${userRole}) [${socket.id}]`);
        // Personal room — receives all notifications for this user
        socket.join(`user:${userId}`);
        // Join hospital room if hospital_admin — use JWT-embedded hospitalId for targeted events
        if (userRole === 'hospital_admin') {
            const hospitalId = socket.hospitalId;
            if (hospitalId) {
                socket.join(`hospital:${hospitalId}`);
                logger_1.logger.debug(`Hospital admin ${userId} joined room: hospital:${hospitalId}`);
            }
            else {
                // Fallback: look up via ambulance assignment if hospitalId was not in the token
                const amb = await database_1.prisma.ambulance.findFirst({
                    where: { driverId: userId },
                    select: { assignedHospitalId: true },
                });
                if (amb?.assignedHospitalId) {
                    socket.join(`hospital:${amb.assignedHospitalId}`);
                    logger_1.logger.debug(`Hospital admin ${userId} joined room (fallback): hospital:${amb.assignedHospitalId}`);
                }
                else {
                    // Last resort: join all hospitals so they at least get some notifications
                    socket.join('hospital:all');
                    logger_1.logger.warn(`Hospital admin ${userId} joined hospital:all (no assignedHospitalId found)`);
                }
            }
        }
        // Join provider room if provider_manager
        if (userRole === 'provider_manager') {
            const providerId = socket.providerId;
            if (providerId) {
                socket.join(`provider:${providerId}`);
                logger_1.logger.debug(`Provider manager ${userId} joined room: provider:${providerId}`);
            }
        }
        // ── Driver: join active request room ──────────────────────────
        socket.on('driver:joinRequest', (requestId) => {
            socket.join(`request:${requestId}`);
            logger_1.logger.debug(`Driver ${userId} joined request room: ${requestId}`);
        });
        // ── Driver: stream GPS location ───────────────────────────────
        socket.on('driver:location', async (data) => {
            try {
                await database_1.prisma.ambulance.update({
                    where: { id: data.ambulanceId },
                    data: { lat: data.lat, lng: data.lng },
                });
                if (data.requestId) {
                    await database_1.prisma.locationLog.create({
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
            }
            catch (err) {
                logger_1.logger.error(`driver:location error: ${err.message}`);
            }
        });
        // ── Citizen: join their request room ──────────────────────────
        socket.on('citizen:trackRequest', (requestId) => {
            socket.join(`request:${requestId}`);
            logger_1.logger.debug(`Citizen ${userId} joined tracking room: ${requestId}`);
        });
        // ── Hospital admin: join specific hospital room ────────────────
        socket.on('hospital:join', (hospitalId) => {
            socket.join(`hospital:${hospitalId}`);
            logger_1.logger.debug(`Hospital admin joined room: hospital:${hospitalId}`);
        });
        // ── Disconnect ─────────────────────────────────────────────────
        socket.on('disconnect', (reason) => {
            logger_1.logger.info(`Socket disconnected: ${userId} — ${reason}`);
        });
    });
    logger_1.logger.info('Socket.io initialised');
};
exports.initSocket = initSocket;
/** Get IO instance (for use in services) */
const getIO = () => {
    if (!io)
        throw new Error('Socket.io not initialised');
    return io;
};
exports.getIO = getIO;
//# sourceMappingURL=socket.js.map