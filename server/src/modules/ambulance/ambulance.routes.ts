import { Router } from 'express';
import { z } from 'zod';
import { AmbulanceController } from './ambulance.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();
router.use(authenticate);

const createAmbulanceSchema = z.object({
  body: z.object({
    plateNumber: z.string().trim().min(1, 'Plate number required'),
    hospitalId: z.string().min(1, 'Hospital ID required'),
    driverId: z.string().uuid().optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
});

const updateAmbulanceStatusSchema = z.object({
  body: z.object({
    status: z.enum(['available', 'dispatched', 'offline', 'maintenance']),
  }),
});

const updateAmbulanceLocationSchema = z.object({
  body: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    requestId: z.string().uuid().optional(),
  }),
});

// GET /api/ambulances
router.get('/', AmbulanceController.list);

// PATCH /api/ambulances/my-status  [driver only] — driver updates own ambulance status
router.patch(
  '/my-status',
  authorize('driver'),
  validate(updateAmbulanceStatusSchema),
  AmbulanceController.updateMyStatus
);

// GET /api/ambulances/:id
router.get('/:id', AmbulanceController.getById);

// POST /api/ambulances  [admin only]
router.post(
  '/',
  authorize('admin'),
  validate(createAmbulanceSchema),
  AmbulanceController.create
);

// PATCH /api/ambulances/:id/status  [admin]
router.patch(
  '/:id/status',
  authorize('admin'),
  validate(updateAmbulanceStatusSchema),
  AmbulanceController.updateStatus
);

// PATCH /api/ambulances/:id/location  [driver, admin]
router.patch(
  '/:id/location',
  authorize('driver', 'admin'),
  validate(updateAmbulanceLocationSchema),
  AmbulanceController.updateLocation
);

// DELETE /api/ambulances/:id  [admin]
router.delete('/:id', authorize('admin'), AmbulanceController.remove);

export default router;
