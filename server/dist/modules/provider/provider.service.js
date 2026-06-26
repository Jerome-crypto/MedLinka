"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderService = void 0;
const database_1 = require("../../config/database");
const AppError_1 = require("../../utils/AppError");
exports.ProviderService = {
    async list() {
        return database_1.prisma.provider.findMany({
            include: {
                _count: { select: { ambulances: true, users: true } },
            },
            orderBy: { name: 'asc' },
        });
    },
    async getById(id) {
        const provider = await database_1.prisma.provider.findUnique({
            where: { id },
            include: {
                ambulances: {
                    include: { driver: { select: { id: true, name: true, phone: true } } },
                },
                users: {
                    select: { id: true, name: true, role: true, phone: true },
                },
            },
        });
        if (!provider)
            throw new AppError_1.AppError('Provider not found', 404);
        return provider;
    },
    async create(data) {
        return database_1.prisma.provider.create({ data });
    },
    async update(id, data) {
        const provider = await database_1.prisma.provider.findUnique({ where: { id } });
        if (!provider)
            throw new AppError_1.AppError('Provider not found', 404);
        return database_1.prisma.provider.update({ where: { id }, data });
    },
    async getFleetStatus(providerId) {
        const ambulances = await database_1.prisma.ambulance.findMany({
            where: { providerId },
            include: { driver: { select: { name: true, phone: true } } },
        });
        const summary = {
            total: ambulances.length,
            available: ambulances.filter((a) => a.status === 'available').length,
            dispatched: ambulances.filter((a) => a.status === 'dispatched').length,
            offline: ambulances.filter((a) => a.status === 'offline').length,
            maintenance: ambulances.filter((a) => a.status === 'maintenance').length,
        };
        return { summary, ambulances };
    },
};
//# sourceMappingURL=provider.service.js.map