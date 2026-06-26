"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1, 'Name is required'),
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        phone: zod_1.z.string().trim().optional().or(zod_1.z.literal('')),
        role: zod_1.z.enum(['citizen', 'driver', 'hospital_admin', 'provider_manager', 'admin']).optional(),
        providerId: zod_1.z.string().uuid().optional(),
        hospitalId: zod_1.z.string().uuid().optional(),
    }),
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
const refreshSchema = zod_1.z.object({
    body: zod_1.z.object({ refreshToken: zod_1.z.string().min(1, 'Refresh token required') }),
});
const forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({ email: zod_1.z.string().email('Invalid email') }),
});
const verifyOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email'),
        otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    }),
});
const resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email'),
        otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
        newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
// POST /api/auth/register
router.post('/register', (0, validate_middleware_1.validate)(registerSchema), auth_controller_1.AuthController.register);
// POST /api/auth/login
router.post('/login', (0, validate_middleware_1.validate)(loginSchema), auth_controller_1.AuthController.login);
// POST /api/auth/refresh
router.post('/refresh', (0, validate_middleware_1.validate)(refreshSchema), auth_controller_1.AuthController.refresh);
// GET /api/auth/me  [protected]
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.AuthController.me);
// POST /api/auth/logout  [protected]
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.AuthController.logout);
// POST /api/auth/forgot-password  — request OTP
router.post('/forgot-password', (0, validate_middleware_1.validate)(forgotPasswordSchema), auth_controller_1.AuthController.forgotPassword);
// POST /api/auth/verify-otp  — validate OTP
router.post('/verify-otp', (0, validate_middleware_1.validate)(verifyOtpSchema), auth_controller_1.AuthController.verifyOtp);
// POST /api/auth/reset-password  — set new password
router.post('/reset-password', (0, validate_middleware_1.validate)(resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map