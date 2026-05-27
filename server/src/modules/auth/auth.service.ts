import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { Role } from '@prisma/client';
import { logger } from '../../config/logger';
import { EmailService } from '../../utils/email.service';

interface RegisterDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: Role;
  providerId?: string;
  hospitalId?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

const signAccess = (payload: { id: string; role: string; email: string; hospitalId?: string | null; providerId?: string | null }) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);

const signRefresh = (id: string) =>
  jwt.sign({ id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions);

/** Look up the assigned hospital for a hospital_admin directly from User model */
async function resolveHospitalId(userId: string, role: string): Promise<string | null> {
  if (role !== 'hospital_admin') return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hospitalId: true },
  });
  return user?.hospitalId ?? null;
}

/** Look up the providerId for a provider_manager directly from User model */
async function resolveProviderId(userId: string, role: string): Promise<string | null> {
  if (role !== 'provider_manager' && role !== 'driver') return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { providerId: true },
  });
  return user?.providerId ?? null;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const AuthService = {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new AppError('Email address already registered', 409);

    if (dto.phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: dto.phone } });
      if (existingPhone) throw new AppError('Phone number already registered', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await prisma.user.create({
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
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    // Send onboarding/welcome verification email
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    const hash = await bcrypt.hash(otp, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: hash, passwordResetExpiry: expiry },
    });

    // Fire email in background
    EmailService.sendVerificationEmail(user.email, otp).catch(err => {
      logger.error(`Failed to send registration email to ${user.email}:`, err);
    });

    return { user, accessToken, refreshToken };
  },

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const hospitalId = await resolveHospitalId(user.id, user.role);
    const providerId = await resolveProviderId(user.id, user.role);
    const accessToken = signAccess({ id: user.id, role: user.role, email: user.email, hospitalId, providerId });
    const refreshToken = signRefresh(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    return {
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, hospitalId, providerId },
      accessToken,
      refreshToken,
    };
  },

  async refresh(token: string) {
    let payload: { id: string };
    try {
      payload = jwt.verify(token, config.jwt.refreshSecret) as { id: string };
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.refreshToken !== token) throw new AppError('Refresh token revoked', 401);

    const hospitalId = await resolveHospitalId(user.id, user.role);
    const providerId = await resolveProviderId(user.id, user.role);
    const accessToken = signAccess({ id: user.id, role: user.role, email: user.email, hospitalId, providerId });
    const newRefresh = signRefresh(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });

    return { accessToken, refreshToken: newRefresh };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, email: true, role: true, providerId: true, hospitalId: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async logout(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  },

  // ── OTP / Password Reset ──────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Don't reveal details, always say "If registered..."
    if (!user) return { message: 'If that email is registered, a code has been sent.' };

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hash = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: hash, passwordResetExpiry: expiry },
    });

    // Send email using SMTP
    await EmailService.sendPasswordResetEmail(email, otp);

    return { message: 'If that email is registered, a code has been sent.' };
  },

  async verifyOtp(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
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

  async resetPassword(email: string, otp: string, newPassword: string) {
    // Re-verify OTP before resetting
    await AuthService.verifyOtp(email, otp);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });

    return { message: 'Password updated successfully.' };
  },
};
