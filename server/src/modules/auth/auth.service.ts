import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { Role } from '@prisma/client';
import logger from '../../config/logger';

interface RegisterDto { name: string; phone: string; email?: string; password: string; role?: Role; }
interface LoginDto    { phone: string; password: string; }

const signAccess   = (payload: { id: string; role: string; phone: string }) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
const signRefresh  = (id: string) =>
  jwt.sign({ id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions);

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const AuthService = {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new AppError('Phone number already registered', 409);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await prisma.user.create({
      data: { name: dto.name, phone: dto.phone, email: dto.email, passwordHash, role: dto.role ?? 'citizen' },
      select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
    });

    const accessToken  = signAccess({ id: user.id, role: user.role, phone: user.phone });
    const refreshToken = signRefresh(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return { user, accessToken, refreshToken };
  },

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const accessToken  = signAccess({ id: user.id, role: user.role, phone: user.phone });
    const refreshToken = signRefresh(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return {
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  },

  async refresh(token: string) {
    let payload: { id: string };
    try { payload = jwt.verify(token, config.jwt.refreshSecret) as { id: string }; }
    catch { throw new AppError('Invalid refresh token', 401); }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.refreshToken !== token) throw new AppError('Refresh token revoked', 401);

    const accessToken  = signAccess({ id: user.id, role: user.role, phone: user.phone });
    const newRefresh   = signRefresh(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });

    return { accessToken, refreshToken: newRefresh };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async logout(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  },

  // ── OTP / Password Reset ──────────────────────────────────────────

  async forgotPassword(phone: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    // Don't reveal whether the phone exists — always return success
    if (!user) return { message: 'If that number is registered, a code has been sent.' };

    const otp    = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hash   = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data:  { passwordResetToken: hash, passwordResetExpiry: expiry },
    });

    // In production: send via SMS (Twilio / Africa's Talking)
    // For now we log it clearly for testing
    logger.info(`[OTP] Reset code for ${phone}: ${otp} (expires ${expiry.toISOString()})`);

    return { message: 'If that number is registered, a code has been sent.' };
  },

  async verifyOtp(phone: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.passwordResetToken || !user.passwordResetExpiry) {
      throw new AppError('Invalid or expired verification code', 400);
    }
    if (new Date() > user.passwordResetExpiry) {
      throw new AppError('Verification code has expired. Please request a new one.', 400);
    }
    const valid = await bcrypt.compare(otp, user.passwordResetToken);
    if (!valid) throw new AppError('Incorrect verification code', 400);

    return { valid: true };
  },

  async resetPassword(phone: string, otp: string, newPassword: string) {
    // Re-verify OTP before resetting
    await AuthService.verifyOtp(phone, otp);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new AppError('User not found', 404);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });

    return { message: 'Password updated successfully.' };
  },
};
