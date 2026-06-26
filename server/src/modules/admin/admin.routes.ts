import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Apply auth middleware - Admin ONLY
router.use(authenticate, authorize('admin'));

// GET /api/admin/users
router.get('/users', AdminController.listUsers);

export default router;
