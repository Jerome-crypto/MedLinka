"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const provider_controller_1 = require("./provider.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const createProviderSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1),
        type: zod_1.z.enum(['hospital', 'private', 'ngo', 'government']),
        contactEmail: zod_1.z.string().email().optional(),
        contactPhone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    }),
});
const managerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
        phone: zod_1.z.string().optional(),
    }),
});
// Admin ONLY routes
router.get('/', (0, auth_middleware_1.authorize)('admin'), provider_controller_1.ProviderController.list);
router.post('/', (0, auth_middleware_1.authorize)('admin'), (0, validate_middleware_1.validate)(createProviderSchema), provider_controller_1.ProviderController.create);
router.get('/:id', (0, auth_middleware_1.authorize)('admin'), provider_controller_1.ProviderController.getById);
router.post('/:id/managers', (0, auth_middleware_1.authorize)('admin'), (0, validate_middleware_1.validate)(managerSchema), provider_controller_1.ProviderController.createManager);
// Provider Manager routes
router.get('/me/fleet', (0, auth_middleware_1.authorize)('provider_manager'), provider_controller_1.ProviderController.getMyFleet);
router.get('/me/drivers', (0, auth_middleware_1.authorize)('provider_manager'), provider_controller_1.ProviderController.getMyDrivers);
router.post('/me/drivers', (0, auth_middleware_1.authorize)('provider_manager'), (0, validate_middleware_1.validate)(managerSchema), provider_controller_1.ProviderController.createDriver);
exports.default = router;
//# sourceMappingURL=provider.routes.js.map