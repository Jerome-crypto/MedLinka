import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';

export const HospitalService = {
  async list() {
    return prisma.hospital.findMany({
      include: {
        ambulances: {
          select: { id: true, plateNumber: true, status: true },
        },
        _count: { select: { requests: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: string) {
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        ambulances: {
          include: { driver: { select: { id: true, name: true, phone: true } } },
        },
      },
    });
    if (!hospital) throw new AppError('Hospital not found', 404);
    return hospital;
  },

  async create(data: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    phone: string;
    capacity?: number;
  }) {
    return prisma.hospital.create({ data });
  },

  async update(id: string, data: Partial<{
    name: string; address: string; lat: number; lng: number;
    phone: string; capacity: number; isActive: boolean;
  }>) {
    const hospital = await prisma.hospital.findUnique({ where: { id } });
    if (!hospital) throw new AppError('Hospital not found', 404);
    return prisma.hospital.update({ where: { id }, data });
  },

  /** Incoming patients for a hospital dashboard */
  async getIncomingPatients(hospitalId: string) {
    return prisma.emergencyRequest.findMany({
      where: {
        hospitalId,
        status: { in: ['dispatched', 'in_progress'] },
      },
      include: {
        citizen: { select: { name: true, phone: true } },
        ambulance: {
          select: {
            plateNumber: true,
            lat: true,
            lng: true,
            driver: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { requestedAt: 'asc' },
    });
  },
};
