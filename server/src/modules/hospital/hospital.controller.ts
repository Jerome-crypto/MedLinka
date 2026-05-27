import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { HospitalService } from './hospital.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { AuthService } from '../auth/auth.service';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';

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

  async mine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await HospitalService.getMyHospital(req.user!.id, req.user!.hospitalId));
    } catch (err) { next(err); }
  },

  async createAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;
      const hospitalId = req.params.id;
      
      const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
      if (!hospital) throw new AppError('Hospital not found', 404);

      const userDetails = await AuthService.register({
        name,
        email,
        password,
        phone,
        role: 'hospital_admin',
        hospitalId,
      });
      sendCreated(res, userDetails, 'Hospital admin created successfully');
    } catch (err) { next(err); }
  },
};
