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
router.get('/mine', authorize('hospital_admin', 'admin'), HospitalController.mine);
router.get('/:id', HospitalController.getById);
router.get('/:id/incoming', authorize('hospital_admin', 'admin'), HospitalController.incoming);

const createHospitalAdminSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().trim().optional().or(z.literal('')),
  }),
});

router.post(
  '/',
  authorize('admin'),
  validate(createHospitalSchema),
  HospitalController.create
);

router.patch('/:id', authorize('admin'), HospitalController.update);
router.post('/:id/admins', authorize('admin'), validate(createHospitalAdminSchema), HospitalController.createAdmin);

// Hospital Admin Fleet & Driver Management
const createDriverSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().trim().optional(),
  }),
});

const registerAmbulanceSchema = z.object({
  body: z.object({
    plateNumber: z.string().trim().min(1, 'Plate number required'),
    ambulanceType: z.string().optional(),
    equipmentLevel: z.number().int().min(1).optional(),
  }),
});

const assignDriverSchema = z.object({
  body: z.object({
    driverId: z.string().uuid().optional().nullable(),
  }),
});

router.get('/mine/drivers', authorize('hospital_admin'), HospitalController.getMyDrivers);
router.post('/mine/drivers', authorize('hospital_admin'), validate(createDriverSchema), HospitalController.createMyDriver);
router.get('/mine/ambulances', authorize('hospital_admin'), HospitalController.getMyAmbulances);
router.post('/mine/ambulances', authorize('hospital_admin'), validate(registerAmbulanceSchema), HospitalController.createMyAmbulance);
router.patch('/mine/ambulances/:id/driver', authorize('hospital_admin'), validate(assignDriverSchema), HospitalController.assignMyDriver);

export default router;
