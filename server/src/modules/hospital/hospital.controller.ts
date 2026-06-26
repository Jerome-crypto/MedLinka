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

  async getMyDrivers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const hospitalId = req.user!.hospitalId;
      if (!hospitalId) throw new AppError('No hospital assigned to this account', 403);

      const drivers = await prisma.user.findMany({
        where: { hospitalId, role: 'driver' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          ambulance: { select: { id: true, plateNumber: true } },
        },
        orderBy: { name: 'asc' },
      });
      sendSuccess(res, drivers);
    } catch (err) { next(err); }
  },

  async createMyDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const hospitalId = req.user!.hospitalId;
      if (!hospitalId) throw new AppError('No hospital assigned to this account', 403);

      const { name, email, password, phone } = req.body;
      const userDetails = await AuthService.register({
        name,
        email,
        password,
        phone,
        role: 'driver',
        hospitalId,
      });
      sendCreated(res, userDetails, 'Driver registered successfully');
    } catch (err) { next(err); }
  },

  async getMyAmbulances(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const hospitalId = req.user!.hospitalId;
      if (!hospitalId) throw new AppError('No hospital assigned to this account', 403);

      const ambulances = await prisma.ambulance.findMany({
        where: { assignedHospitalId: hospitalId },
        include: {
          driver: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { plateNumber: 'asc' },
      });
      sendSuccess(res, ambulances);
    } catch (err) { next(err); }
  },

  async createMyAmbulance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const hospitalId = req.user!.hospitalId;
      if (!hospitalId) throw new AppError('No hospital assigned to this account', 403);

      const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
      if (!hospital) throw new AppError('Hospital not found', 404);

      // Find or create a provider of type hospital with the name of this hospital
      let provider = await prisma.provider.findFirst({
        where: { name: `${hospital.name} EMS`, type: 'hospital' }
      });
      if (!provider) {
        provider = await prisma.provider.create({
          data: {
            name: `${hospital.name} EMS`,
            type: 'hospital',
            contactPhone: hospital.phone,
            address: hospital.address,
          }
        });
      }

      const { plateNumber, ambulanceType, equipmentLevel } = req.body;
      const ambulance = await prisma.ambulance.create({
        data: {
          plateNumber,
          ambulanceType,
          equipmentLevel: equipmentLevel ? parseInt(equipmentLevel) : 1,
          assignedHospitalId: hospitalId,
          providerId: provider.id,
          status: 'available',
        },
        include: {
          driver: { select: { id: true, name: true } },
        },
      });

      sendCreated(res, ambulance, 'Ambulance registered successfully');
    } catch (err) { next(err); }
  },

  async assignMyDriver(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const hospitalId = req.user!.hospitalId;
      if (!hospitalId) throw new AppError('No hospital assigned to this account', 403);

      const { driverId } = req.body;
      const ambulanceId = req.params.id;

      const amb = await prisma.ambulance.findFirst({
        where: { id: ambulanceId, assignedHospitalId: hospitalId },
      });
      if (!amb) throw new AppError('Ambulance not found or not assigned to this hospital', 404);

      if (driverId) {
        const driver = await prisma.user.findFirst({
          where: { id: driverId, hospitalId, role: 'driver' },
        });
        if (!driver) throw new AppError('Driver not found or not registered under this hospital', 400);
      }

      // Re-use core driver assignment logic
      // Note: we need to import AmbulanceService for this, but we can do it inline or at the top of the file
      const { AmbulanceService } = require('../ambulance/ambulance.service');
      const updated = await AmbulanceService.assignDriver(ambulanceId, driverId || null);

      sendSuccess(res, updated, 'Driver assignment updated');
    } catch (err) { next(err); }
  },
};
