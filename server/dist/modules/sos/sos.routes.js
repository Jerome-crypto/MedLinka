"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const sos_controller_1 = require("./sos.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
const createSosSchema = zod_1.z.object({
    body: zod_1.z.object({
        pickupLat: zod_1.z.number().min(-90).max(90),
        pickupLng: zod_1.z.number().min(-180).max(180),
        pickupAddress: zod_1.z.string().optional(),
        patientName: zod_1.z.string().optional(),
        patientAge: zod_1.z.number().min(0).max(150).optional(),
        medicalNotes: zod_1.z.string().optional(),
    }),
});
const listSosSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    }).optional(),
});
const updateSosStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['in_progress', 'arrived', 'in_transit', 'completed', 'cancelled']),
    }),
});
const directTransportSchema = zod_1.z.object({
    body: zod_1.z.object({
        hospitalId: zod_1.z.string().uuid(),
        pickupLat: zod_1.z.number().min(-90).max(90),
        pickupLng: zod_1.z.number().min(-180).max(180),
        pickupAddress: zod_1.z.string().optional(),
        patientName: zod_1.z.string().optional(),
        patientAge: zod_1.z.number().min(0).max(150).optional(),
        medicalNotes: zod_1.z.string().optional(),
    }),
});
// All SOS routes require authentication
router.use(auth_middleware_1.authenticate);
// POST /api/sos/direct-transport – driver initiates transport
router.post('/direct-transport', (0, auth_middleware_1.authorize)('driver'), (0, validate_middleware_1.validate)(directTransportSchema), sos_controller_1.SosController.createDirectTransport);
// POST /api/sos  – citizen creates SOS
router.post('/', (0, auth_middleware_1.authorize)('citizen', 'admin'), (0, validate_middleware_1.validate)(createSosSchema), sos_controller_1.SosController.create);
// GET /api/sos  – list requests (filtered by role)
router.get('/', (0, validate_middleware_1.validate)(listSosSchema), sos_controller_1.SosController.list);
// GET /api/sos/:id  – single request
router.get('/:id', sos_controller_1.SosController.getById);
// PATCH /api/sos/:id/status  – driver/admin status update
router.patch('/:id/status', (0, auth_middleware_1.authorize)('driver', 'admin'), (0, validate_middleware_1.validate)(updateSosStatusSchema), sos_controller_1.SosController.updateStatus);
// PATCH /api/sos/:id/cancel  – citizen cancel
router.patch('/:id/cancel', (0, auth_middleware_1.authorize)('citizen'), sos_controller_1.SosController.cancel);
// POST /api/sos/:id/acknowledge  – hospital marks bed ready
router.post('/:id/acknowledge', (0, auth_middleware_1.authorize)('hospital_admin', 'admin'), sos_controller_1.SosController.acknowledge);
exports.default = router;
//# sourceMappingURL=sos.routes.js.map