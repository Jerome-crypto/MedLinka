"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SosService = void 0;
const database_1 = require("../../config/database");
const AppError_1 = require("../../utils/AppError");
const dispatch_service_1 = require("../dispatch/dispatch.service");
const socket_1 = require("../../sockets/socket");
const logger_1 = require("../../config/logger");
exports.SosService = {
    /** Create a new SOS request and immediately trigger dispatch */
    async create(dto) {
        const request = await database_1.prisma.emergencyRequest.create({
            data: {
                citizenId: dto.citizenId,
                pickupLat: dto.pickupLat,
                pickupLng: dto.pickupLng,
                pickupAddress: dto.pickupAddress,
                patientName: dto.patientName,
                patientAge: dto.patientAge,
                medicalNotes: dto.medicalNotes,
                status: 'pending',
            },
        });
        logger_1.logger.info(`SOS request ${request.id} created by citizen ${dto.citizenId}`);
        // Trigger dispatch algorithm (non-blocking — errors are logged, not thrown)
        dispatch_service_1.DispatchService.dispatch(request.id, dto.pickupLat, dto.pickupLng).catch((err) => {
            logger_1.logger.error(`Dispatch failed for request ${request.id}: ${err.message}`);
            // Update status to reflect failure
            database_1.prisma.emergencyRequest.update({
                where: { id: request.id },
                data: { status: 'pending' },
            }).catch(() => { });
        });
        return request;
    },
    /** Get single request with full relations */
    async getById(requestId, userId, userRole) {
        const request = await database_1.prisma.emergencyRequest.findUnique({
            where: { id: requestId },
            include: {
                citizen: { select: { id: true, name: true, phone: true } },
                ambulance: {
                    include: { driver: { select: { id: true, name: true, phone: true } } },
                },
                hospital: true,
            },
        });
        if (!request)
            throw new AppError_1.AppError('Request not found', 404);
        // Citizens can only view their own requests
        if (userRole === 'citizen' && request.citizenId !== userId) {
            throw new AppError_1.AppError('Access forbidden', 403);
        }
        return request;
    },
    /** List requests — filtered by role */
    async list(userId, userRole, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = userRole === 'citizen'
            ? { citizenId: userId }
            : userRole === 'driver'
                ? { ambulance: { driverId: userId } }
                : {};
        const [requests, total] = await Promise.all([
            database_1.prisma.emergencyRequest.findMany({
                where,
                include: {
                    citizen: { select: { id: true, name: true, phone: true } },
                    ambulance: { select: { plateNumber: true, driver: { select: { name: true } } } },
                    hospital: { select: { name: true } },
                },
                orderBy: { requestedAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.emergencyRequest.count({ where }),
        ]);
        return { requests, total, page, limit, totalPages: Math.ceil(total / limit) };
    },
    /** Driver / admin update request status */
    async updateStatus(requestId, status, userId, userRole) {
        const request = await database_1.prisma.emergencyRequest.findUnique({
            where: { id: requestId },
            include: { ambulance: true },
        });
        if (!request)
            throw new AppError_1.AppError('Request not found', 404);
        // Drivers can only update their own assigned requests
        if (userRole === 'driver' && request.ambulance?.driverId !== userId) {
            throw new AppError_1.AppError('Not your request', 403);
        }
        const now = new Date();
        const timestamps = {};
        if (status === 'arrived')
            timestamps.arrivedAt = now;
        if (status === 'completed') {
            timestamps.completedAt = now;
            // Free the ambulance
            if (request.ambulanceId) {
                await database_1.prisma.ambulance.update({
                    where: { id: request.ambulanceId },
                    data: { status: 'available' },
                });
            }
        }
        if (status === 'cancelled' && request.ambulanceId) {
            await database_1.prisma.ambulance.update({
                where: { id: request.ambulanceId },
                data: { status: 'available' },
            });
        }
        const updated = await database_1.prisma.emergencyRequest.update({
            where: { id: requestId },
            data: { status, ...timestamps },
        });
        // Broadcast status change
        try {
            const io = (0, socket_1.getIO)();
            io.to(`request:${requestId}`).emit('sos:statusUpdate', {
                requestId,
                status,
                timestamp: now,
            });
        }
        catch (err) {
            logger_1.logger.warn(`Failed to broadcast status update via socket: ${err.message}`);
        }
        return updated;
    },
    /** Citizen cancel their own pending request */
    async cancel(requestId, citizenId) {
        const request = await database_1.prisma.emergencyRequest.findUnique({ where: { id: requestId } });
        if (!request)
            throw new AppError_1.AppError('Request not found', 404);
        if (request.citizenId !== citizenId)
            throw new AppError_1.AppError('Access forbidden', 403);
        if (!['pending', 'dispatched'].includes(request.status)) {
            throw new AppError_1.AppError('Cannot cancel a request that is already in progress', 400);
        }
        return exports.SosService.updateStatus(requestId, 'cancelled', citizenId, 'citizen');
    },
    /** Hospital admin acknowledges incoming patient — marks bed ready */
    async acknowledge(requestId, _userId) {
        const request = await database_1.prisma.emergencyRequest.findUnique({ where: { id: requestId } });
        if (!request)
            throw new AppError_1.AppError('Request not found', 404);
        return database_1.prisma.emergencyRequest.update({
            where: { id: requestId },
            data: { acknowledgedAt: new Date() },
            select: { id: true, status: true, acknowledgedAt: true },
        });
    },
    async createDirectTransport(dto) {
        const ambulance = await database_1.prisma.ambulance.findFirst({
            where: { driverId: dto.driverId },
            include: { provider: true },
        });
        if (!ambulance)
            throw new AppError_1.AppError('No ambulance assigned to this driver', 400);
        const request = await database_1.prisma.emergencyRequest.create({
            data: {
                citizenId: dto.driverId,
                hospitalId: dto.hospitalId,
                ambulanceId: ambulance.id,
                status: 'in_transit',
                pickupLat: dto.pickupLat,
                pickupLng: dto.pickupLng,
                pickupAddress: dto.pickupAddress || 'Direct Transport Pickup',
                patientName: dto.patientName,
                patientAge: dto.patientAge,
                medicalNotes: dto.medicalNotes,
                dispatchedAt: new Date(),
                estimatedEta: 600,
            },
            include: {
                citizen: { select: { id: true, name: true, phone: true } },
                ambulance: { include: { driver: { select: { id: true, name: true, phone: true } } } },
                hospital: true,
            },
        });
        await database_1.prisma.ambulance.update({
            where: { id: ambulance.id },
            data: { status: 'dispatched' },
        });
        try {
            const io = (0, socket_1.getIO)();
            io.to(`hospital:${dto.hospitalId}`).emit('hospital:incoming', {
                requestId: request.id,
                etaSeconds: 600,
                patient: {
                    name: request.patientName,
                    age: request.patientAge,
                    medicalNotes: request.medicalNotes,
                    pickupLat: dto.pickupLat,
                    pickupLng: dto.pickupLng,
                },
                ambulancePlate: ambulance.plateNumber,
                providerName: ambulance.provider.name,
            });
        }
        catch (err) {
            logger_1.logger.warn(`Failed to broadcast direct transport via socket: ${err.message}`);
        }
        return request;
    },
};
//# sourceMappingURL=sos.service.js.map