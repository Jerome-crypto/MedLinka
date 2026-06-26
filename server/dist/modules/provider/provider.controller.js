"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderController = void 0;
const provider_service_1 = require("./provider.service");
const AppError_1 = require("../../utils/AppError");
const auth_service_1 = require("../auth/auth.service");
const database_1 = require("../../config/database");
exports.ProviderController = {
    async list(req, res, next) {
        try {
            const providers = await provider_service_1.ProviderService.list();
            res.json({ status: 'success', data: providers });
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const provider = await provider_service_1.ProviderService.getById(req.params.id);
            res.json({ status: 'success', data: provider });
        }
        catch (e) {
            next(e);
        }
    },
    async create(req, res, next) {
        try {
            const provider = await provider_service_1.ProviderService.create(req.body);
            res.status(201).json({ status: 'success', data: provider });
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            const provider = await provider_service_1.ProviderService.update(req.params.id, req.body);
            res.json({ status: 'success', data: provider });
        }
        catch (e) {
            next(e);
        }
    },
    async getMyFleet(req, res, next) {
        try {
            const providerId = req.user.providerId;
            if (!providerId) {
                throw new AppError_1.AppError('No provider assigned to this account', 403);
            }
            const data = await provider_service_1.ProviderService.getFleetStatus(providerId);
            res.json({ status: 'success', data });
        }
        catch (e) {
            next(e);
        }
    },
    async createManager(req, res, next) {
        try {
            const { name, email, password, phone } = req.body;
            const providerId = req.params.id;
            const provider = await database_1.prisma.provider.findUnique({ where: { id: providerId } });
            if (!provider)
                throw new AppError_1.AppError('Provider not found', 404);
            const userDetails = await auth_service_1.AuthService.register({
                name,
                email,
                password,
                phone,
                role: 'provider_manager',
                providerId,
            });
            res.status(201).json({ status: 'success', data: userDetails });
        }
        catch (e) {
            next(e);
        }
    },
    async getMyDrivers(req, res, next) {
        try {
            const providerId = req.user.providerId;
            if (!providerId)
                throw new AppError_1.AppError('No provider assigned to this account', 403);
            const drivers = await database_1.prisma.user.findMany({
                where: { providerId, role: 'driver' },
                select: { id: true, name: true, email: true, phone: true, createdAt: true, ambulance: { select: { id: true, plateNumber: true } } },
                orderBy: { name: 'asc' },
            });
            res.json({ status: 'success', data: drivers });
        }
        catch (e) {
            next(e);
        }
    },
    async createDriver(req, res, next) {
        try {
            const providerId = req.user.providerId;
            if (!providerId)
                throw new AppError_1.AppError('No provider assigned to this account', 403);
            const { name, email, password, phone } = req.body;
            const userDetails = await auth_service_1.AuthService.register({
                name,
                email,
                password,
                phone,
                role: 'driver',
                providerId,
            });
            res.status(201).json({ status: 'success', data: userDetails });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=provider.controller.js.map