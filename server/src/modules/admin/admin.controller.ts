import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';

export const AdminController = {
  async listUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      sendSuccess(res, { users });
    } catch (err) {
      next(err);
    }
  },
};
