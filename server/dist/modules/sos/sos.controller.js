"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SosController = void 0;
const sos_service_1 = require("./sos.service");
const response_1 = require("../../utils/response");
exports.SosController = {
    async create(req, res, next) {
        try {
            const request = await sos_service_1.SosService.create({ citizenId: req.user.id, ...req.body });
            (0, response_1.sendCreated)(res, request, 'SOS request created — dispatching nearest ambulance');
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            const request = await sos_service_1.SosService.getById(req.params.id, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, request);
        }
        catch (err) {
            next(err);
        }
    },
    async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await sos_service_1.SosService.list(req.user.id, req.user.role, page, limit);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const updated = await sos_service_1.SosService.updateStatus(req.params.id, req.body.status, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, updated, 'Status updated');
        }
        catch (err) {
            next(err);
        }
    },
    async cancel(req, res, next) {
        try {
            const updated = await sos_service_1.SosService.cancel(req.params.id, req.user.id);
            (0, response_1.sendSuccess)(res, updated, 'Request cancelled');
        }
        catch (err) {
            next(err);
        }
    },
    async acknowledge(req, res, next) {
        try {
            const updated = await sos_service_1.SosService.acknowledge(req.params.id, req.user.id);
            (0, response_1.sendSuccess)(res, updated, 'Request acknowledged');
        }
        catch (err) {
            next(err);
        }
    },
    async createDirectTransport(req, res, next) {
        try {
            const request = await sos_service_1.SosService.createDirectTransport({ driverId: req.user.id, ...req.body });
            (0, response_1.sendCreated)(res, request, 'Direct transport request created successfully');
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=sos.controller.js.map