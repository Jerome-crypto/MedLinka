import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated } from '../../utils/response';
import { AppError } from '../../utils/AppError';
import { Role } from '@prisma/client';

// ── List all users ────────────────────────────────────────────────────
async function listUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        providerId: true,
        hospitalId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, { users });
  } catch (err) { next(err); }
}

// ── Create a new user ─────────────────────────────────────────────────
async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, phone, role, hospitalId, providerId } = req.body as {
      name: string; email: string; password: string; phone?: string;
      role?: Role; hospitalId?: string; providerId?: string;
    };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email address already registered', 409);

    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) throw new AppError('Phone number already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: role ?? 'citizen',
        hospitalId: hospitalId || null,
        providerId: providerId || null,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, hospitalId: true, providerId: true, createdAt: true },
    });

    sendCreated(res, user, 'User account created successfully');
  } catch (err) { next(err); }
}

// ── Update an existing user ───────────────────────────────────────────
async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive, hospitalId, providerId, password } = req.body as {
      name?: string; email?: string; phone?: string | null; role?: Role;
      isActive?: boolean; hospitalId?: string | null; providerId?: string | null; password?: string;
    };

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new AppError('User not found', 404);

    // Check email uniqueness if changing
    if (email && email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) throw new AppError('Email address already in use', 409);
    }

    // Check phone uniqueness if changing
    if (phone && phone !== existing.phone) {
      const taken = await prisma.user.findFirst({ where: { phone } });
      if (taken) throw new AppError('Phone number already in use', 409);
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined)       data.name       = name;
    if (email !== undefined)      data.email      = email;
    if (phone !== undefined)      data.phone      = phone || null;
    if (role !== undefined)       data.role       = role;
    if (isActive !== undefined)   data.isActive   = isActive;
    if (hospitalId !== undefined) data.hospitalId = hospitalId || null;
    if (providerId !== undefined) data.providerId = providerId || null;
    if (password)                 data.passwordHash = await bcrypt.hash(password, 12);

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, hospitalId: true, providerId: true, createdAt: true },
    });

    sendSuccess(res, updated, 'User updated successfully');
  } catch (err) { next(err); }
}

// ── Delete a user (with safe cascade) ────────────────────────────────
async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new AppError('User not found', 404);

    await prisma.$transaction(async (tx) => {
      // 1. Unassign driver from ambulances
      await tx.ambulance.updateMany({ where: { driverId: id }, data: { driverId: null } });

      // 2. Find all emergency requests made by this citizen
      const requests = await tx.emergencyRequest.findMany({
        where: { citizenId: id },
        select: { id: true },
      });
      const requestIds = requests.map((r) => r.id);

      // 3. Delete location logs tied to those requests
      if (requestIds.length) {
        await tx.locationLog.deleteMany({ where: { requestId: { in: requestIds } } });
        // 4. Delete notifications tied to those requests
        await tx.notification.deleteMany({ where: { requestId: { in: requestIds } } });
        // 5. Delete the emergency requests themselves
        await tx.emergencyRequest.deleteMany({ where: { citizenId: id } });
      }

      // 6. Delete notifications addressed to this user
      await tx.notification.deleteMany({ where: { userId: id } });

      // 7. Delete audit log entries where this user was the actor
      await tx.auditLog.deleteMany({ where: { actorId: id } });

      // 8. Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    sendSuccess(res, null, 'User deleted successfully');
  } catch (err) { next(err); }
}

export const AdminController = { listUsers, createUser, updateUser, deleteUser };
