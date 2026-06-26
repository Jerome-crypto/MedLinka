"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const ambulance_controller_1 = require("./ambulance.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const createAmbulanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        plateNumber: zod_1.z.string().trim().min(1, 'Plate number required'),
        providerId: zod_1.z.string().uuid('Provider ID must be a UUID').optional(),
        assignedHospitalId: zod_1.z.string().uuid().optional(),
        ambulanceType: zod_1.z.string().optional(),
        equipmentLevel: zod_1.z.number().int().min(1).optional(),
        driverId: zod_1.z.string().uuid().optional(),
        lat: zod_1.z.number().min(-90).max(90).optional(),
        lng: zod_1.z.number().min(-180).max(180).optional(),
    }),
});
const updateAmbulanceStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['available', 'dispatched', 'offline', 'maintenance']),
    }),
});
const updateAmbulanceLocationSchema = zod_1.z.object({
    body: zod_1.z.object({
        lat: zod_1.z.number().min(-90).max(90),
        lng: zod_1.z.number().min(-180).max(180),
        requestId: zod_1.z.string().uuid().optional(),
    }),
});
// GET /api/ambulances
router.get('/', ambulance_controller_1.AmbulanceController.list);
// PATCH /api/ambulances/my-status  [driver only] — driver updates own ambulance status
router.patch('/my-status', (0, auth_middleware_1.authorize)('driver'), (0, validate_middleware_1.validate)(updateAmbulanceStatusSchema), ambulance_controller_1.AmbulanceController.updateMyStatus);
// GET /api/ambulances/:id
router.get('/:id', ambulance_controller_1.AmbulanceController.getById);
// POST /api/ambulances  [admin, provider_manager]
router.post('/', (0, auth_middleware_1.authorize)('admin', 'provider_manager'), (0, validate_middleware_1.validate)(createAmbulanceSchema), ambulance_controller_1.AmbulanceController.create);
// PATCH /api/ambulances/:id/status  [admin, provider_manager]
router.patch('/:id/status', (0, auth_middleware_1.authorize)('admin', 'provider_manager'), (0, validate_middleware_1.validate)(updateAmbulanceStatusSchema), ambulance_controller_1.AmbulanceController.updateStatus);
// PATCH /api/ambulances/:id/driver  [admin, provider_manager]
router.patch('/:id/driver', (0, auth_middleware_1.authorize)('admin', 'provider_manager'), (0, validate_middleware_1.validate)(zod_1.z.object({ body: zod_1.z.object({ driverId: zod_1.z.string().uuid().optional().nullable() }) })), ambulance_controller_1.AmbulanceController.assignDriver);
// PATCH /api/ambulances/:id/location  [driver, admin]
router.patch('/:id/location', (0, auth_middleware_1.authorize)('driver', 'admin'), (0, validate_middleware_1.validate)(updateAmbulanceLocationSchema), ambulance_controller_1.AmbulanceController.updateLocation);
// DELETE /api/ambulances/:id  [admin, provider_manager]
router.delete('/:id', (0, auth_middleware_1.authorize)('admin', 'provider_manager'), ambulance_controller_1.AmbulanceController.remove);
exports.default = router;
//# sourceMappingURL=ambulance.routes.js.map