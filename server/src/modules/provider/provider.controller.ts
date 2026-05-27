import { Request, Response, NextFunction } from 'express';
import { ProviderService } from './provider.service';
import { AppError } from '../../utils/AppError';
import { AuthService } from '../auth/auth.service';
import { prisma } from '../../config/database';

export const ProviderController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const providers = await ProviderService.list();
      res.json({ status: 'success', data: providers });
    } catch (e) { next(e); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = await ProviderService.getById(req.params.id);
      res.json({ status: 'success', data: provider });
    } catch (e) { next(e); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = await ProviderService.create(req.body);
      res.status(201).json({ status: 'success', data: provider });
    } catch (e) { next(e); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = await ProviderService.update(req.params.id, req.body);
      res.json({ status: 'success', data: provider });
    } catch (e) { next(e); }
  },

  async getMyFleet(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user.providerId;
      if (!providerId) {
        throw new AppError('No provider assigned to this account', 403);
      }
      const data = await ProviderService.getFleetStatus(providerId);
      res.json({ status: 'success', data });
    } catch (e) { next(e); }
  },

  async createManager(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, phone } = req.body;
      const providerId = req.params.id;
      
      const provider = await prisma.provider.findUnique({ where: { id: providerId } });
      if (!provider) throw new AppError('Provider not found', 404);

      const userDetails = await AuthService.register({
        name,
        email,
        password,
        phone,
        role: 'provider_manager',
        providerId,
      });
      res.status(201).json({ status: 'success', data: userDetails });
    } catch (e) { next(e); }
  },

  async getMyDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user.providerId;
      if (!providerId) throw new AppError('No provider assigned to this account', 403);
      
      const drivers = await prisma.user.findMany({
        where: { providerId, role: 'driver' },
        select: { id: true, name: true, email: true, phone: true, createdAt: true, ambulance: { select: { id: true, plateNumber: true } } },
        orderBy: { name: 'asc' },
      });
      res.json({ status: 'success', data: drivers });
    } catch (e) { next(e); }
  },

  async createDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user.providerId;
      if (!providerId) throw new AppError('No provider assigned to this account', 403);
      
      const { name, email, password, phone } = req.body;
      const userDetails = await AuthService.register({
        name,
        email,
        password,
        phone,
        role: 'driver',
        providerId,
      });
      res.status(201).json({ status: 'success', data: userDetails });
    } catch (e) { next(e); }
  },
};
