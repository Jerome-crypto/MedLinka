import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';

export const ProviderService = {
  async list() {
    return prisma.provider.findMany({
      include: {
        _count: { select: { ambulances: true, users: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async getById(id: string) {
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        ambulances: {
          include: { driver: { select: { id: true, name: true, phone: true } } },
        },
        users: {
          select: { id: true, name: true, role: true, phone: true },
        },
      },
    });
    if (!provider) throw new AppError('Provider not found', 404);
    return provider;
  },

  async create(data: {
    name: string;
    type: 'hospital' | 'private' | 'ngo' | 'government';
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  }) {
    return prisma.provider.create({ data });
  },

  async update(id: string, data: Partial<{
    name: string;
    type: 'hospital' | 'private' | 'ngo' | 'government';
    contactEmail: string;
    contactPhone: string;
    address: string;
    operatingStatus: boolean;
  }>) {
    const provider = await prisma.provider.findUnique({ where: { id } });
    if (!provider) throw new AppError('Provider not found', 404);
    return prisma.provider.update({ where: { id }, data });
  },

  async getFleetStatus(providerId: string) {
    const ambulances = await prisma.ambulance.findMany({
      where: { providerId },
      include: { driver: { select: { name: true, phone: true } } },
    });

    const summary = {
      total: ambulances.length,
      available: ambulances.filter((a) => a.status === 'available').length,
      dispatched: ambulances.filter((a) => a.status === 'dispatched').length,
      offline: ambulances.filter((a) => a.status === 'offline').length,
      maintenance: ambulances.filter((a) => a.status === 'maintenance').length,
    };

    return { summary, ambulances };
  },
};
