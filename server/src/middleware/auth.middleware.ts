import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    phone: string | null;
    hospitalId?: string | null;
    providerId?: string | null;
  };
}

/**
 * Verifies the Bearer JWT and attaches user info to req.user
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.jwt.secret) as {
      id: string;
      role: string;
      phone?: string | null;
      hospitalId?: string | null;
      providerId?: string | null;
    };

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, phone: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or deactivated', 401);
    }

    req.user = {
      id: user.id,
      role: user.role,
      phone: user.phone,
      hospitalId: payload.hospitalId,
      providerId: payload.providerId,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid or expired token', 401));
    } else {
      next(err);
    }
  }
};

/**
 * Role-based access guard – call after authenticate()
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError('Access forbidden: insufficient privileges', 403));
      return;
    }
    next();
  };
};
