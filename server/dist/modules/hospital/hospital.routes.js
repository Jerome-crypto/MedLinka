"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const hospital_controller_1 = require("./hospital.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const createHospitalSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1, 'Name is required'),
        address: zod_1.z.string().trim().min(1, 'Address is required'),
        lat: zod_1.z.number().min(-90).max(90),
        lng: zod_1.z.number().min(-180).max(180),
        phone: zod_1.z.string().trim().min(1, 'Phone is required'),
        capacity: zod_1.z.number().int().min(1).optional(),
    }),
});
router.get('/', hospital_controller_1.HospitalController.list);
router.get('/mine', (0, auth_middleware_1.authorize)('hospital_admin', 'admin'), hospital_controller_1.HospitalController.mine);
router.get('/:id', hospital_controller_1.HospitalController.getById);
router.get('/:id/incoming', (0, auth_middleware_1.authorize)('hospital_admin', 'admin'), hospital_controller_1.HospitalController.incoming);
const createHospitalAdminSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1, 'Name is required'),
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        phone: zod_1.z.string().trim().optional().or(zod_1.z.literal('')),
    }),
});
router.post('/', (0, auth_middleware_1.authorize)('admin'), (0, validate_middleware_1.validate)(createHospitalSchema), hospital_controller_1.HospitalController.create);
router.patch('/:id', (0, auth_middleware_1.authorize)('admin'), hospital_controller_1.HospitalController.update);
router.post('/:id/admins', (0, auth_middleware_1.authorize)('admin'), (0, validate_middleware_1.validate)(createHospitalAdminSchema), hospital_controller_1.HospitalController.createAdmin);
// Hospital Admin Fleet & Driver Management
const createDriverSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1, 'Name is required'),
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        phone: zod_1.z.string().trim().optional(),
    }),
});
const registerAmbulanceSchema = zod_1.z.object({
    body: zod_1.z.object({
        plateNumber: zod_1.z.string().trim().min(1, 'Plate number required'),
        ambulanceType: zod_1.z.string().optional(),
        equipmentLevel: zod_1.z.number().int().min(1).optional(),
    }),
});
const assignDriverSchema = zod_1.z.object({
    body: zod_1.z.object({
        driverId: zod_1.z.string().uuid().optional().nullable(),
    }),
});
router.get('/mine/drivers', (0, auth_middleware_1.authorize)('hospital_admin'), hospital_controller_1.HospitalController.getMyDrivers);
router.post('/mine/drivers', (0, auth_middleware_1.authorize)('hospital_admin'), (0, validate_middleware_1.validate)(createDriverSchema), hospital_controller_1.HospitalController.createMyDriver);
router.get('/mine/ambulances', (0, auth_middleware_1.authorize)('hospital_admin'), hospital_controller_1.HospitalController.getMyAmbulances);
router.post('/mine/ambulances', (0, auth_middleware_1.authorize)('hospital_admin'), (0, validate_middleware_1.validate)(registerAmbulanceSchema), hospital_controller_1.HospitalController.createMyAmbulance);
router.patch('/mine/ambulances/:id/driver', (0, auth_middleware_1.authorize)('hospital_admin'), (0, validate_middleware_1.validate)(assignDriverSchema), hospital_controller_1.HospitalController.assignMyDriver);
exports.default = router;
//# sourceMappingURL=hospital.routes.js.map