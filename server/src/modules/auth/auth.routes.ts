import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name:       z.string().trim().min(1, 'Name is required'),
    email:      z.string().email('Invalid email'),
    password:   z.string().min(6, 'Password must be at least 6 characters'),
    phone:      z.string().trim().optional().or(z.literal('')),
    role:       z.enum(['citizen', 'driver', 'hospital_admin', 'provider_manager', 'admin']).optional(),
    providerId: z.string().uuid().optional(),
    hospitalId: z.string().uuid().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email:    z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(1, 'Refresh token required') }),
});

const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email('Invalid email') }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    otp:   z.string().length(6, 'OTP must be 6 digits'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email:       z.string().email('Invalid email'),
    otp:         z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), AuthController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), AuthController.login);

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), AuthController.refresh);

// GET /api/auth/me  [protected]
router.get('/me', authenticate, AuthController.me);

// POST /api/auth/logout  [protected]
router.post('/logout', authenticate, AuthController.logout);

// POST /api/auth/forgot-password  — request OTP
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);

// POST /api/auth/verify-otp  — validate OTP
router.post('/verify-otp', validate(verifyOtpSchema), AuthController.verifyOtp);

// POST /api/auth/reset-password  — set new password
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

export default router;
