import { Router } from 'express';
import { z } from 'zod';
import { HospitalController } from './hospital.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();
router.use(authenticate);

const createHospitalSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    address: z.string().trim().min(1, 'Address is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    phone: z.string().trim().min(1, 'Phone is required'),
    capacity: z.number().int().min(1).optional(),
  }),
});

router.get('/', HospitalController.list);
router.get('/:id', HospitalController.getById);
router.get('/:id/incoming', authorize('hospital_admin', 'admin'), HospitalController.incoming);

router.post(
  '/',
  authorize('admin'),
  validate(createHospitalSchema),
  HospitalController.create
);

router.patch('/:id', authorize('admin'), HospitalController.update);

export default router;
