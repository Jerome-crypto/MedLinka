"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalService = void 0;
const database_1 = require("../../config/database");
const AppError_1 = require("../../utils/AppError");
exports.HospitalService = {
    async list() {
        return database_1.prisma.hospital.findMany({
            include: {
                ambulances: {
                    select: { id: true, plateNumber: true, status: true },
                },
                _count: { select: { requests: true } },
            },
            orderBy: { name: 'asc' },
        });
    },
    async getById(id) {
        const hospital = await database_1.prisma.hospital.findUnique({
            where: { id },
            include: {
                ambulances: {
                    include: { driver: { select: { id: true, name: true, phone: true } } },
                },
            },
        });
        if (!hospital)
            throw new AppError_1.AppError('Hospital not found', 404);
        return hospital;
    },
    async create(data) {
        return database_1.prisma.hospital.create({ data });
    },
    async update(id, data) {
        const hospital = await database_1.prisma.hospital.findUnique({ where: { id } });
        if (!hospital)
            throw new AppError_1.AppError('Hospital not found', 404);
        return database_1.prisma.hospital.update({ where: { id }, data });
    },
    /** Get the hospital for a logged-in hospital_admin */
    async getMyHospital(userId, hospitalIdFromToken) {
        // Fast path: hospitalId was embedded in the JWT
        if (hospitalIdFromToken) {
            const hospital = await database_1.prisma.hospital.findUnique({ where: { id: hospitalIdFromToken } });
            if (hospital)
                return hospital;
        }
        // Fallback: look up via ambulance assignment
        const amb = await database_1.prisma.ambulance.findFirst({
            where: { driverId: userId },
            select: { assignedHospitalId: true },
        });
        if (amb?.assignedHospitalId) {
            const hospital = await database_1.prisma.hospital.findUnique({ where: { id: amb.assignedHospitalId } });
            if (hospital)
                return hospital;
        }
        // Last resort: first hospital in the system
        const first = await database_1.prisma.hospital.findFirst({ orderBy: { name: 'asc' } });
        if (first)
            return first;
        throw new AppError_1.AppError('No hospital found for this account', 404);
    },
    /** Incoming patients for a hospital dashboard */
    async getIncomingPatients(hospitalId) {
        return database_1.prisma.emergencyRequest.findMany({
            where: {
                hospitalId,
                status: { in: ['dispatched', 'in_progress', 'arrived', 'in_transit'] },
            },
            include: {
                citizen: { select: { name: true, phone: true } },
                ambulance: {
                    select: {
                        plateNumber: true,
                        lat: true,
                        lng: true,
                        driver: { select: { name: true, phone: true } },
                    },
                },
            },
            orderBy: { requestedAt: 'asc' },
        });
    },
};
//# sourceMappingURL=hospital.service.js.map