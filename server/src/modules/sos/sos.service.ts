import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { DispatchService } from '../dispatch/dispatch.service';
import { getIO } from '../../sockets/socket';
import { logger } from '../../config/logger';

interface CreateSosDto {
  citizenId: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress?: string;
  patientName?: string;
  patientAge?: number;
  medicalNotes?: string;
}

export const SosService = {
  /** Create a new SOS request and immediately trigger dispatch */
  async create(dto: CreateSosDto) {
    const request = await prisma.emergencyRequest.create({
      data: {
        citizenId: dto.citizenId,
        pickupLat: dto.pickupLat,
        pickupLng: dto.pickupLng,
        pickupAddress: dto.pickupAddress,
        patientName: dto.patientName,
        patientAge: dto.patientAge,
        medicalNotes: dto.medicalNotes,
        status: 'pending',
      },
    });

    logger.info(`SOS request ${request.id} created by citizen ${dto.citizenId}`);

    // Trigger dispatch algorithm (non-blocking — errors are logged, not thrown)
    DispatchService.dispatch(request.id, dto.pickupLat, dto.pickupLng).catch((err) => {
      logger.error(`Dispatch failed for request ${request.id}: ${err.message}`);
      // Update status to reflect failure
      prisma.emergencyRequest.update({
        where: { id: request.id },
        data: { status: 'pending' },
      }).catch(() => {});
    });

    return request;
  },

  /** Get single request with full relations */
  async getById(requestId: string, userId: string, userRole: string) {
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: {
        citizen: { select: { id: true, name: true, phone: true } },
        ambulance: {
          include: { driver: { select: { id: true, name: true, phone: true } } },
        },
        hospital: true,
      },
    });

    if (!request) throw new AppError('Request not found', 404);

    // Citizens can only view their own requests
    if (userRole === 'citizen' && request.citizenId !== userId) {
      throw new AppError('Access forbidden', 403);
    }

    return request;
  },

  /** List requests — filtered by role */
  async list(userId: string, userRole: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where =
      userRole === 'citizen'
        ? { citizenId: userId }
        : userRole === 'driver'
        ? { ambulance: { driverId: userId } }
        : {};

    const [requests, total] = await Promise.all([
      prisma.emergencyRequest.findMany({
        where,
        include: {
          citizen: { select: { id: true, name: true, phone: true } },
          ambulance: { select: { plateNumber: true, driver: { select: { name: true } } } },
          hospital: { select: { name: true } },
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emergencyRequest.count({ where }),
    ]);

    return { requests, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  /** Driver / admin update request status */
  async updateStatus(
    requestId: string,
    status: 'in_progress' | 'arrived' | 'completed' | 'cancelled',
    userId: string,
    userRole: string
  ) {
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: { ambulance: true },
    });

    if (!request) throw new AppError('Request not found', 404);

    // Drivers can only update their own assigned requests
    if (userRole === 'driver' && request.ambulance?.driverId !== userId) {
      throw new AppError('Not your request', 403);
    }

    const now = new Date();
    const timestamps: Record<string, Date | null> = {};
    if (status === 'arrived') timestamps.arrivedAt = now;
    if (status === 'completed') {
      timestamps.completedAt = now;
      // Free the ambulance
      if (request.ambulanceId) {
        await prisma.ambulance.update({
          where: { id: request.ambulanceId },
          data: { status: 'available' },
        });
      }
    }
    if (status === 'cancelled' && request.ambulanceId) {
      await prisma.ambulance.update({
        where: { id: request.ambulanceId },
        data: { status: 'available' },
      });
    }

    const updated = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: { status, ...timestamps },
    });

    // Broadcast status change
    const io = getIO();
    io.to(`request:${requestId}`).emit('sos:statusUpdate', {
      requestId,
      status,
      timestamp: now,
    });

    return updated;
  },

  /** Citizen cancel their own pending request */
  async cancel(requestId: string, citizenId: string) {
    const request = await prisma.emergencyRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new AppError('Request not found', 404);
    if (request.citizenId !== citizenId) throw new AppError('Access forbidden', 403);
    if (!['pending', 'dispatched'].includes(request.status)) {
      throw new AppError('Cannot cancel a request that is already in progress', 400);
    }
    return SosService.updateStatus(requestId, 'cancelled', citizenId, 'citizen');
  },

  /** Hospital admin acknowledges incoming patient — marks bed ready */
  async acknowledge(requestId: string, _userId: string) {
    const request = await prisma.emergencyRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new AppError('Request not found', 404);

    return prisma.emergencyRequest.update({
      where: { id: requestId },
      data:  { acknowledgedAt: new Date() },
      select: { id: true, status: true, acknowledgedAt: true },
    });
  },
};

