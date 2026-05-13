import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { HospitalService } from './hospital.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export const HospitalController = {
  async list(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await HospitalService.list()); }
    catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await HospitalService.getById(req.params.id)); }
    catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendCreated(res, await HospitalService.create(req.body), 'Hospital created'); }
    catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await HospitalService.update(req.params.id, req.body)); }
    catch (err) { next(err); }
  },

  async incoming(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await HospitalService.getIncomingPatients(req.params.id)); }
    catch (err) { next(err); }
  },
};
