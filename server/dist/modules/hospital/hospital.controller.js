"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalController = void 0;
const hospital_service_1 = require("./hospital.service");
const response_1 = require("../../utils/response");
const auth_service_1 = require("../auth/auth.service");
const database_1 = require("../../config/database");
const AppError_1 = require("../../utils/AppError");
exports.HospitalController = {
    async list(_req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await hospital_service_1.HospitalService.list());
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await hospital_service_1.HospitalService.getById(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            (0, response_1.sendCreated)(res, await hospital_service_1.HospitalService.create(req.body), 'Hospital created');
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await hospital_service_1.HospitalService.update(req.params.id, req.body));
        }
        catch (err) {
            next(err);
        }
    },
    async incoming(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await hospital_service_1.HospitalService.getIncomingPatients(req.params.id));
        }
        catch (err) {
            next(err);
        }
    },
    async mine(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await hospital_service_1.HospitalService.getMyHospital(req.user.id, req.user.hospitalId));
        }
        catch (err) {
            next(err);
        }
    },
    async createAdmin(req, res, next) {
        try {
            const { name, email, password, phone } = req.body;
            const hospitalId = req.params.id;
            const hospital = await database_1.prisma.hospital.findUnique({ where: { id: hospitalId } });
            if (!hospital)
                throw new AppError_1.AppError('Hospital not found', 404);
            const userDetails = await auth_service_1.AuthService.register({
                name,
                email,
                password,
                phone,
                role: 'hospital_admin',
                hospitalId,
            });
            (0, response_1.sendCreated)(res, userDetails, 'Hospital admin created successfully');
        }
        catch (err) {
            next(err);
        }
    },
    async getMyDrivers(req, res, next) {
        try {
            const hospitalId = req.user.hospitalId;
            if (!hospitalId)
                throw new AppError_1.AppError('No hospital assigned to this account', 403);
            const drivers = await database_1.prisma.user.findMany({
                where: { hospitalId, role: 'driver' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    ambulance: { select: { id: true, plateNumber: true } },
                },
                orderBy: { name: 'asc' },
            });
            (0, response_1.sendSuccess)(res, drivers);
        }
        catch (err) {
            next(err);
        }
    },
    async createMyDriver(req, res, next) {
        try {
            const hospitalId = req.user.hospitalId;
            if (!hospitalId)
                throw new AppError_1.AppError('No hospital assigned to this account', 403);
            const { name, email, password, phone } = req.body;
            const userDetails = await auth_service_1.AuthService.register({
                name,
                email,
                password,
                phone,
                role: 'driver',
                hospitalId,
            });
            (0, response_1.sendCreated)(res, userDetails, 'Driver registered successfully');
        }
        catch (err) {
            next(err);
        }
    },
    async getMyAmbulances(req, res, next) {
        try {
            const hospitalId = req.user.hospitalId;
            if (!hospitalId)
                throw new AppError_1.AppError('No hospital assigned to this account', 403);
            const ambulances = await database_1.prisma.ambulance.findMany({
                where: { assignedHospitalId: hospitalId },
                include: {
                    driver: { select: { id: true, name: true, phone: true } },
                },
                orderBy: { plateNumber: 'asc' },
            });
            (0, response_1.sendSuccess)(res, ambulances);
        }
        catch (err) {
            next(err);
        }
    },
    async createMyAmbulance(req, res, next) {
        try {
            const hospitalId = req.user.hospitalId;
            if (!hospitalId)
                throw new AppError_1.AppError('No hospital assigned to this account', 403);
            const hospital = await database_1.prisma.hospital.findUnique({ where: { id: hospitalId } });
            if (!hospital)
                throw new AppError_1.AppError('Hospital not found', 404);
            // Find or create a provider of type hospital with the name of this hospital
            let provider = await database_1.prisma.provider.findFirst({
                where: { name: `${hospital.name} EMS`, type: 'hospital' }
            });
            if (!provider) {
                provider = await database_1.prisma.provider.create({
                    data: {
                        name: `${hospital.name} EMS`,
                        type: 'hospital',
                        contactPhone: hospital.phone,
                        address: hospital.address,
                    }
                });
            }
            const { plateNumber, ambulanceType, equipmentLevel } = req.body;
            const ambulance = await database_1.prisma.ambulance.create({
                data: {
                    plateNumber,
                    ambulanceType,
                    equipmentLevel: equipmentLevel ? parseInt(equipmentLevel) : 1,
                    assignedHospitalId: hospitalId,
                    providerId: provider.id,
                    status: 'available',
                },
                include: {
                    driver: { select: { id: true, name: true } },
                },
            });
            (0, response_1.sendCreated)(res, ambulance, 'Ambulance registered successfully');
        }
        catch (err) {
            next(err);
        }
    },
    async assignMyDriver(req, res, next) {
        try {
            const hospitalId = req.user.hospitalId;
            if (!hospitalId)
                throw new AppError_1.AppError('No hospital assigned to this account', 403);
            const { driverId } = req.body;
            const ambulanceId = req.params.id;
            const amb = await database_1.prisma.ambulance.findFirst({
                where: { id: ambulanceId, assignedHospitalId: hospitalId },
            });
            if (!amb)
                throw new AppError_1.AppError('Ambulance not found or not assigned to this hospital', 404);
            if (driverId) {
                const driver = await database_1.prisma.user.findFirst({
                    where: { id: driverId, hospitalId, role: 'driver' },
                });
                if (!driver)
                    throw new AppError_1.AppError('Driver not found or not registered under this hospital', 400);
            }
            // Re-use core driver assignment logic
            // Note: we need to import AmbulanceService for this, but we can do it inline or at the top of the file
            const { AmbulanceService } = require('../ambulance/ambulance.service');
            const updated = await AmbulanceService.assignDriver(ambulanceId, driverId || null);
            (0, response_1.sendSuccess)(res, updated, 'Driver assignment updated');
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=hospital.controller.js.map