import { Router } from 'express';
import { z } from 'zod';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();

// Apply auth middleware — Admin ONLY
router.use(authenticate, authorize('admin'));

// ── Validation Schemas ────────────────────────────────────────────────

const createUserSchema = z.object({
  body: z.object({
    name:       z.string().trim().min(1, 'Name is required'),
    email:      z.string().email('Invalid email address'),
    password:   z.string().min(6, 'Password must be at least 6 characters'),
    phone:      z.string().trim().optional().or(z.literal('')),
    role:       z.enum(['citizen', 'driver', 'hospital_admin', 'provider_manager', 'admin']).optional(),
    hospitalId: z.string().uuid().optional().or(z.literal('')),
    providerId: z.string().uuid().optional().or(z.literal('')),
  }),
});

const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid user ID') }),
  body: z.object({
    name:       z.string().trim().min(1).optional(),
    email:      z.string().email().optional(),
    password:   z.string().min(6).optional().or(z.literal('')),
    phone:      z.string().trim().optional().nullable(),
    role:       z.enum(['citizen', 'driver', 'hospital_admin', 'provider_manager', 'admin']).optional(),
    isActive:   z.boolean().optional(),
    hospitalId: z.string().uuid().optional().nullable().or(z.literal('')),
    providerId: z.string().uuid().optional().nullable().or(z.literal('')),
  }),
});

const userIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid user ID') }),
});

// ── Routes ────────────────────────────────────────────────────────────

// GET  /api/admin/users        — list all users
router.get('/users', AdminController.listUsers);

// POST /api/admin/users        — create a new user
router.post('/users', validate(createUserSchema), AdminController.createUser);

// PATCH /api/admin/users/:id   — update a user's details
router.patch('/users/:id', validate(updateUserSchema), AdminController.updateUser);

// DELETE /api/admin/users/:id  — permanently delete a user
router.delete('/users/:id', validate(userIdParamSchema), AdminController.deleteUser);

export default router;
