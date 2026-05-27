import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendCreated } from '../../utils/response';

export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, await AuthService.register(req.body), 'Registration successful'); }
    catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await AuthService.login(req.body), 'Login successful'); }
    catch (err) { next(err); }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await AuthService.refresh(req.body.refreshToken), 'Token refreshed'); }
    catch (err) { next(err); }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await AuthService.getMe(req.user!.id)); }
    catch (err) { next(err); }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { await AuthService.logout(req.user!.id); sendSuccess(res, null, 'Logged out successfully'); }
    catch (err) { next(err); }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await AuthService.forgotPassword(req.body.email)); }
    catch (err) { next(err); }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await AuthService.verifyOtp(req.body.email, req.body.otp)); }
    catch (err) { next(err); }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      sendSuccess(res, await AuthService.resetPassword(email, otp, newPassword));
    }
    catch (err) { next(err); }
  },
};

