import { Router } from 'express';
import { z } from 'zod';
import { SosController } from './sos.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();

const createSosSchema = z.object({
  body: z.object({
    pickupLat: z.number().min(-90).max(90),
    pickupLng: z.number().min(-180).max(180),
    pickupAddress: z.string().optional(),
    patientName: z.string().optional(),
    patientAge: z.number().min(0).max(150).optional(),
    medicalNotes: z.string().optional(),
  }),
});

const listSosSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

const updateSosStatusSchema = z.object({
  body: z.object({
    status: z.enum(['in_progress', 'arrived', 'in_transit', 'completed', 'cancelled']),
  }),
});

const directTransportSchema = z.object({
  body: z.object({
    hospitalId: z.string().uuid(),
    pickupLat: z.number().min(-90).max(90),
    pickupLng: z.number().min(-180).max(180),
    pickupAddress: z.string().optional(),
    patientName: z.string().optional(),
    patientAge: z.number().min(0).max(150).optional(),
    medicalNotes: z.string().optional(),
  }),
});

// All SOS routes require authentication
router.use(authenticate);

// POST /api/sos/direct-transport – driver initiates transport
router.post(
  '/direct-transport',
  authorize('driver'),
  validate(directTransportSchema),
  SosController.createDirectTransport
);

// POST /api/sos  – citizen creates SOS
router.post(
  '/',
  authorize('citizen', 'admin'),
  validate(createSosSchema),
  SosController.create
);

// GET /api/sos  – list requests (filtered by role)
router.get(
  '/',
  validate(listSosSchema),
  SosController.list
);

// GET /api/sos/:id  – single request
router.get('/:id', SosController.getById);

// PATCH /api/sos/:id/status  – driver/admin status update
router.patch(
  '/:id/status',
  authorize('driver', 'admin'),
  validate(updateSosStatusSchema),
  SosController.updateStatus
);

// PATCH /api/sos/:id/cancel  – citizen cancel
router.patch('/:id/cancel', authorize('citizen'), SosController.cancel);

// POST /api/sos/:id/acknowledge  – hospital marks bed ready
router.post('/:id/acknowledge', authorize('hospital_admin', 'admin'), SosController.acknowledge);

export default router;
