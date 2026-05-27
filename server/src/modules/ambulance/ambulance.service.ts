import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { getIO } from '../../sockets/socket';

export const AmbulanceService = {
  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [ambulances, total] = await Promise.all([
      prisma.ambulance.findMany({
        include: {
          driver: { select: { id: true, name: true, phone: true } },
          provider: { select: { id: true, name: true } },
          assignedHospital: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ambulance.count(),
    ]);
    return { ambulances, total, page, limit };
  },

  async getById(id: string) {
    const amb = await prisma.ambulance.findUnique({
      where: { id },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
        provider: true,
        assignedHospital: true,
      },
    });
    if (!amb) throw new AppError('Ambulance not found', 404);
    return amb;
  },

  async create(data: {
    plateNumber: string;
    providerId: string;
    assignedHospitalId?: string;
    ambulanceType?: string;
    equipmentLevel?: number;
    driverId?: string;
    lat?: number;
    lng?: number;
  }) {
    return prisma.ambulance.create({
      data,
      include: { driver: { select: { id: true, name: true } }, provider: true, assignedHospital: true },
    });
  },

  async updateStatus(
    id: string,
    status: 'available' | 'dispatched' | 'offline' | 'maintenance'
  ) {
    const amb = await prisma.ambulance.findUnique({ where: { id } });
    if (!amb) throw new AppError('Ambulance not found', 404);
    return prisma.ambulance.update({ where: { id }, data: { status } });
  },

  async updateLocation(id: string, lat: number, lng: number, requestId?: string) {
    // Persist log
    await prisma.locationLog.create({
      data: { ambulanceId: id, lat, lng, requestId },
    });

    // Update ambulance current position
    const amb = await prisma.ambulance.update({
      where: { id },
      data: { lat, lng },
    });

    // Broadcast to any citizen tracking this ambulance
    const io = getIO();
    if (requestId) {
      io.to(`request:${requestId}`).emit('ambulance:locationUpdate', {
        ambulanceId: id,
        lat,
        lng,
        timestamp: new Date(),
      });
    }

    return amb;
  },

  async delete(id: string) {
    const amb = await prisma.ambulance.findUnique({ where: { id } });
    if (!amb) throw new AppError('Ambulance not found', 404);
    if (amb.status === 'dispatched') {
      throw new AppError('Cannot delete a dispatched ambulance', 400);
    }
    return prisma.ambulance.delete({ where: { id } });
  },

  /** Driver updates their own ambulance status without knowing the ambulance ID */
  async updateMyStatus(
    driverId: string,
    status: 'available' | 'dispatched' | 'offline' | 'maintenance'
  ) {
    const amb = await prisma.ambulance.findUnique({ where: { driverId } });
    if (!amb) throw new AppError('No ambulance assigned to this driver', 404);
    return prisma.ambulance.update({ where: { id: amb.id }, data: { status } });
  },

  async assignDriver(id: string, driverId: string | null) {
    const amb = await prisma.ambulance.findUnique({ where: { id } });
    if (!amb) throw new AppError('Ambulance not found', 404);

    if (driverId) {
      const user = await prisma.user.findUnique({ where: { id: driverId } });
      if (!user || user.role !== 'driver') {
        throw new AppError('Invalid driver account', 400);
      }
      await prisma.ambulance.updateMany({
        where: { driverId },
        data: { driverId: null },
      });
    }

    return prisma.ambulance.update({
      where: { id },
      data: { driverId },
      include: { driver: { select: { id: true, name: true, phone: true } } },
    });
  },
};
