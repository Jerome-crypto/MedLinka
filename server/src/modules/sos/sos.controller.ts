import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { SosService } from './sos.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export const SosController = {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await SosService.create({ citizenId: req.user!.id, ...req.body });
      sendCreated(res, request, 'SOS request created — dispatching nearest ambulance');
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await SosService.getById(req.params.id, req.user!.id, req.user!.role);
      sendSuccess(res, request);
    } catch (err) { next(err); }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await SosService.list(req.user!.id, req.user!.role, page, limit);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SosService.updateStatus(
        req.params.id, req.body.status, req.user!.id, req.user!.role
      );
      sendSuccess(res, updated, 'Status updated');
    } catch (err) { next(err); }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SosService.cancel(req.params.id, req.user!.id);
      sendSuccess(res, updated, 'Request cancelled');
    } catch (err) { next(err); }
  },

  async acknowledge(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SosService.acknowledge(req.params.id, req.user!.id);
      sendSuccess(res, updated, 'Request acknowledged');
    } catch (err) { next(err); }
  },

  async createDirectTransport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await SosService.createDirectTransport({ driverId: req.user!.id, ...req.body });
      sendCreated(res, request, 'Direct transport request created successfully');
    } catch (err) { next(err); }
  },
};
