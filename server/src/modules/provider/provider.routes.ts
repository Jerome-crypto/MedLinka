import { Router } from 'express';
import { z } from 'zod';
import { ProviderController } from './provider.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();
router.use(authenticate);

const createProviderSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    type: z.enum(['hospital', 'private', 'ngo', 'government']),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
  }),
});

const managerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
  }),
});

// Admin ONLY routes
router.get('/', authorize('admin'), ProviderController.list);
router.post('/', authorize('admin'), validate(createProviderSchema), ProviderController.create);
router.get('/:id', authorize('admin'), ProviderController.getById);
router.post('/:id/managers', authorize('admin'), validate(managerSchema), ProviderController.createManager);

// Provider Manager routes
router.get('/me/fleet', authorize('provider_manager'), ProviderController.getMyFleet);
router.get('/me/drivers', authorize('provider_manager'), ProviderController.getMyDrivers);
router.post('/me/drivers', authorize('provider_manager'), validate(managerSchema), ProviderController.createDriver);

export default router;
