"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const env_1 = require("../../config/env");
const AppError_1 = require("../../utils/AppError");
const logger_1 = require("../../config/logger");
const email_service_1 = require("../../utils/email.service");
const signAccess = (payload) => jsonwebtoken_1.default.sign(payload, env_1.config.jwt.secret, { expiresIn: env_1.config.jwt.expiresIn });
const signRefresh = (id) => jsonwebtoken_1.default.sign({ id }, env_1.config.jwt.refreshSecret, { expiresIn: env_1.config.jwt.refreshExpiresIn });
/** Look up the assigned hospital for a hospital_admin directly from User model */
async function resolveHospitalId(userId, role) {
    if (role !== 'hospital_admin')
        return null;
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: { hospitalId: true },
    });
    return user?.hospitalId ?? null;
}
/** Look up the providerId for a provider_manager directly from User model */
async function resolveProviderId(userId, role) {
    if (role !== 'provider_manager' && role !== 'driver')
        return null;
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: { providerId: true },
    });
    return user?.providerId ?? null;
}
function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
exports.AuthService = {
    async register(dto) {
        const existing = await database_1.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new AppError_1.AppError('Email address already registered', 409);
        if (dto.phone) {
            const existingPhone = await database_1.prisma.user.findFirst({ where: { phone: dto.phone } });
            if (existingPhone)
                throw new AppError_1.AppError('Phone number already registered', 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(dto.password, 12);
        const user = await database_1.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone || null,
                passwordHash,
                role: dto.role ?? 'citizen',
                providerId: dto.providerId || null,
                hospitalId: dto.hospitalId || null,
            },
            select: { id: true, name: true, phone: true, email: true, role: true, providerId: true, hospitalId: true, createdAt: true },
        });
        const hospitalId = user.hospitalId;
        const providerId = user.providerId;
        const accessToken = signAccess({ id: user.id, role: user.role, email: user.email, hospitalId, providerId });
        const refreshToken = signRefresh(user.id);
        await database_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
        // Send onboarding/welcome verification email
        const otp = generateOtp();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
        const hash = await bcryptjs_1.default.hash(otp, 10);
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { passwordResetToken: hash, passwordResetExpiry: expiry },
        });
        // Fire email in background
        email_service_1.EmailService.sendVerificationEmail(user.email, otp).catch(err => {
            logger_1.logger.error(`Failed to send registration email to ${user.email}:`, err);
        });
        return { user, accessToken, refreshToken };
    },
    async login(dto) {
        const user = await database_1.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.isActive)
            throw new AppError_1.AppError('Invalid credentials', 401);
        const valid = await bcryptjs_1.default.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new AppError_1.AppError('Invalid credentials', 401);
        const hospitalId = await resolveHospitalId(user.id, user.role);
        const providerId = await resolveProviderId(user.id, user.role);
        const accessToken = signAccess({ id: user.id, role: user.role, email: user.email, hospitalId, providerId });
        const refreshToken = signRefresh(user.id);
        await database_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
        return {
            user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, hospitalId, providerId },
            accessToken,
            refreshToken,
        };
    },
    async refresh(token) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, env_1.config.jwt.refreshSecret);
        }
        catch {
            throw new AppError_1.AppError('Invalid refresh token', 401);
        }
        const user = await database_1.prisma.user.findUnique({ where: { id: payload.id } });
        if (!user || user.refreshToken !== token)
            throw new AppError_1.AppError('Refresh token revoked', 401);
        const hospitalId = await resolveHospitalId(user.id, user.role);
        const providerId = await resolveProviderId(user.id, user.role);
        const accessToken = signAccess({ id: user.id, role: user.role, email: user.email, hospitalId, providerId });
        const newRefresh = signRefresh(user.id);
        await database_1.prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });
        return { accessToken, refreshToken: newRefresh };
    },
    async getMe(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, phone: true, email: true, role: true, providerId: true, hospitalId: true, createdAt: true },
        });
        if (!user)
            throw new AppError_1.AppError('User not found', 404);
        return user;
    },
    async logout(userId) {
        await database_1.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    },
    // ── OTP / Password Reset ──────────────────────────────────────────
    async forgotPassword(email) {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        // Don't reveal details, always say "If registered..."
        if (!user)
            return { message: 'If that email is registered, a code has been sent.' };
        const otp = generateOtp();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const hash = await bcryptjs_1.default.hash(otp, 10);
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { passwordResetToken: hash, passwordResetExpiry: expiry },
        });
        // Send email using SMTP
        await email_service_1.EmailService.sendPasswordResetEmail(email, otp);
        return { message: 'If that email is registered, a code has been sent.' };
    },
    async verifyOtp(email, otp) {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordResetToken || !user.passwordResetExpiry) {
            throw new AppError_1.AppError('Invalid or expired verification code', 400);
        }
        if (new Date() > user.passwordResetExpiry) {
            throw new AppError_1.AppError('Verification code has expired. Please request a new one.', 400);
        }
        const valid = await bcryptjs_1.default.compare(otp, user.passwordResetToken);
        if (!valid)
            throw new AppError_1.AppError('Incorrect verification code', 400);
        return { valid: true };
    },
    async resetPassword(email, otp, newPassword) {
        // Re-verify OTP before resetting
        await exports.AuthService.verifyOtp(email, otp);
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new AppError_1.AppError('User not found', 404);
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
        });
        return { message: 'Password updated successfully.' };
    },
};
//# sourceMappingURL=auth.service.js.map