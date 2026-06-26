"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmbulanceService = void 0;
const database_1 = require("../../config/database");
const AppError_1 = require("../../utils/AppError");
const socket_1 = require("../../sockets/socket");
exports.AmbulanceService = {
    async list(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [ambulances, total] = await Promise.all([
            database_1.prisma.ambulance.findMany({
                include: {
                    driver: { select: { id: true, name: true, phone: true } },
                    provider: { select: { id: true, name: true } },
                    assignedHospital: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.ambulance.count(),
        ]);
        return { ambulances, total, page, limit };
    },
    async getById(id) {
        const amb = await database_1.prisma.ambulance.findUnique({
            where: { id },
            include: {
                driver: { select: { id: true, name: true, phone: true } },
                provider: true,
                assignedHospital: true,
            },
        });
        if (!amb)
            throw new AppError_1.AppError('Ambulance not found', 404);
        return amb;
    },
    async create(data) {
        return database_1.prisma.ambulance.create({
            data,
            include: { driver: { select: { id: true, name: true } }, provider: true, assignedHospital: true },
        });
    },
    async updateStatus(id, status) {
        const amb = await database_1.prisma.ambulance.findUnique({ where: { id } });
        if (!amb)
            throw new AppError_1.AppError('Ambulance not found', 404);
        return database_1.prisma.ambulance.update({ where: { id }, data: { status } });
    },
    async updateLocation(id, lat, lng, requestId) {
        // Persist log
        await database_1.prisma.locationLog.create({
            data: { ambulanceId: id, lat, lng, requestId },
        });
        // Update ambulance current position
        const amb = await database_1.prisma.ambulance.update({
            where: { id },
            data: { lat, lng },
        });
        // Broadcast to any citizen tracking this ambulance
        const io = (0, socket_1.getIO)();
        if (requestId) {
            io.to(`request:${requestId}`).emit('ambulance:locationUpdate', {
                ambulanceId: id,
                lat,
                lng,
                timestamp: new Date(),
            });
        }
        return amb;
    },
    async delete(id) {
        const amb = await database_1.prisma.ambulance.findUnique({ where: { id } });
        if (!amb)
            throw new AppError_1.AppError('Ambulance not found', 404);
        if (amb.status === 'dispatched') {
            throw new AppError_1.AppError('Cannot delete a dispatched ambulance', 400);
        }
        return database_1.prisma.ambulance.delete({ where: { id } });
    },
    /** Driver updates their own ambulance status without knowing the ambulance ID */
    async updateMyStatus(driverId, status) {
        const amb = await database_1.prisma.ambulance.findUnique({ where: { driverId } });
        if (!amb)
            throw new AppError_1.AppError('No ambulance assigned to this driver', 404);
        return database_1.prisma.ambulance.update({ where: { id: amb.id }, data: { status } });
    },
    async assignDriver(id, driverId) {
        const amb = await database_1.prisma.ambulance.findUnique({ where: { id } });
        if (!amb)
            throw new AppError_1.AppError('Ambulance not found', 404);
        if (driverId) {
            const user = await database_1.prisma.user.findUnique({ where: { id: driverId } });
            if (!user || user.role !== 'driver') {
                throw new AppError_1.AppError('Invalid driver account', 400);
            }
            await database_1.prisma.ambulance.updateMany({
                where: { driverId },
                data: { driverId: null },
            });
        }
        return database_1.prisma.ambulance.update({
            where: { id },
            data: { driverId },
            include: { driver: { select: { id: true, name: true, phone: true } } },
        });
    },
};
//# sourceMappingURL=ambulance.service.js.map