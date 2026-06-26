"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmbulanceController = void 0;
const ambulance_service_1 = require("./ambulance.service");
const response_1 = require("../../utils/response");
const AppError_1 = require("../../utils/AppError");
exports.AmbulanceController = {
    async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            (0, response_1.sendSuccess)(res, await ambulance_service_1.AmbulanceService.list(page, limit));
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await ambulance_service_1.AmbulanceService.getById(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            if (req.user.role === 'provider_manager') {
                if (!req.user.providerId) {
                    throw new AppError_1.AppError('No provider assigned to this manager account', 403);
                }
                req.body.providerId = req.user.providerId;
            }
            (0, response_1.sendCreated)(res, await ambulance_service_1.AmbulanceService.create(req.body), 'Ambulance created');
        }
        catch (err) {
            next(err);
        }
    },
    async updateStatus(req, res, next) {
        try {
            if (req.user.role === 'provider_manager') {
                const amb = await ambulance_service_1.AmbulanceService.getById(req.params.id);
                if (amb.providerId !== req.user.providerId) {
                    throw new AppError_1.AppError('Unauthorized access to this ambulance', 403);
                }
            }
            (0, response_1.sendSuccess)(res, await ambulance_service_1.AmbulanceService.updateStatus(req.params.id, req.body.status));
        }
        catch (err) {
            next(err);
        }
    },
    async updateLocation(req, res, next) {
        try {
            const { lat, lng, requestId } = req.body;
            (0, response_1.sendSuccess)(res, await ambulance_service_1.AmbulanceService.updateLocation(req.params.id, lat, lng, requestId));
        }
        catch (err) {
            next(err);
        }
    },
    async remove(req, res, next) {
        try {
            if (req.user.role === 'provider_manager') {
                const amb = await ambulance_service_1.AmbulanceService.getById(req.params.id);
                if (amb.providerId !== req.user.providerId) {
                    throw new AppError_1.AppError('Unauthorized access to this ambulance', 403);
                }
            }
            await ambulance_service_1.AmbulanceService.delete(req.params.id);
            (0, response_1.sendNoContent)(res);
        }
        catch (err) {
            next(err);
        }
    },
    async updateMyStatus(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await ambulance_service_1.AmbulanceService.updateMyStatus(req.user.id, req.body.status));
        }
        catch (err) {
            next(err);
        }
    },
    async assignDriver(req, res, next) {
        try {
            const { driverId } = req.body;
            if (req.user.role === 'provider_manager') {
                const amb = await ambulance_service_1.AmbulanceService.getById(req.params.id);
                if (amb.providerId !== req.user.providerId) {
                    throw new AppError_1.AppError('Unauthorized access to this ambulance', 403);
                }
            }
            (0, response_1.sendSuccess)(res, await ambulance_service_1.AmbulanceService.assignDriver(req.params.id, driverId || null));
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=ambulance.controller.js.map