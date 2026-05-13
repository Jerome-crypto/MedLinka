import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AmbulanceService } from './ambulance.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

export const AmbulanceController = {
  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      sendSuccess(res, await AmbulanceService.list(page, limit));
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await AmbulanceService.getById(req.params.id));
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendCreated(res, await AmbulanceService.create(req.body), 'Ambulance created');
    } catch (err) { next(err); }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await AmbulanceService.updateStatus(req.params.id, req.body.status));
    } catch (err) { next(err); }
  },

  async updateLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat, lng, requestId } = req.body;
      sendSuccess(res, await AmbulanceService.updateLocation(req.params.id, lat, lng, requestId));
    } catch (err) { next(err); }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await AmbulanceService.delete(req.params.id);
      sendNoContent(res);
    } catch (err) { next(err); }
  },

  async updateMyStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await AmbulanceService.updateMyStatus(req.user!.id, req.body.status));
    } catch (err) { next(err); }
  },
};
