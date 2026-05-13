import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { haversineDistance, estimateTravelTime } from '../../utils/geo';
import { getIO } from '../../sockets/socket';
import { logger } from '../../config/logger';

/**
 * Core dispatch algorithm:
 * 1. Find all available ambulances with known GPS position
 * 2. Compute Haversine distance from each ambulance to the pickup point
 * 3. Assign the nearest one
 * 4. Emit real-time events to driver, citizen, and the nearest hospital
 */
export const DispatchService = {
  async dispatch(requestId: string, pickupLat: number, pickupLng: number) {
    // Fetch all available ambulances with driver info
    const ambulances = await prisma.ambulance.findMany({
      where: { status: 'available', lat: { not: null }, lng: { not: null } },
      include: { driver: { select: { id: true, name: true, phone: true } }, hospital: true },
    });

    if (ambulances.length === 0) {
      throw new AppError('No ambulances available at this time', 503);
    }

    // Rank by distance
    const ranked = ambulances
      .map((amb) => ({
        ambulance: amb,
        distanceKm: haversineDistance(amb.lat!, amb.lng!, pickupLat, pickupLng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const nearest = ranked[0];
    const etaSeconds = estimateTravelTime(nearest.distanceKm);

    // Update ambulance status → dispatched
    await prisma.ambulance.update({
      where: { id: nearest.ambulance.id },
      data: { status: 'dispatched' },
    });

    // Assign ambulance + hospital + ETA to request
    const updated = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        ambulanceId: nearest.ambulance.id,
        hospitalId: nearest.ambulance.hospitalId,
        status: 'dispatched',
        estimatedEta: etaSeconds,
        dispatchedAt: new Date(),
      },
      include: {
        citizen: { select: { id: true, name: true, phone: true } },
        ambulance: { include: { driver: { select: { id: true, name: true, phone: true } } } },
        hospital: true,
      },
    });

    logger.info(
      `Dispatched ambulance ${nearest.ambulance.plateNumber} to request ${requestId} ` +
      `(${nearest.distanceKm.toFixed(2)} km, ETA ${etaSeconds}s)`
    );

    // ── Real-time notifications ─────────────────────────────────────
    const io = getIO();

    // Notify citizen
    io.to(`user:${updated.citizenId}`).emit('sos:assigned', {
      requestId,
      ambulance: {
        plateNumber: nearest.ambulance.plateNumber,
        driver: nearest.ambulance.driver,
        lat: nearest.ambulance.lat,
        lng: nearest.ambulance.lng,
      },
      etaSeconds,
      hospital: updated.hospital,
    });

    // Notify driver
    if (nearest.ambulance.driverId) {
      io.to(`user:${nearest.ambulance.driverId}`).emit('driver:newRequest', {
        requestId,
        pickupLat,
        pickupLng,
        citizen: updated.citizen,
        medicalNotes: updated.medicalNotes,
        patientName: updated.patientName,
      });
    }

    // Notify hospital
    io.to(`hospital:${nearest.ambulance.hospitalId}`).emit('hospital:incoming', {
      requestId,
      etaSeconds,
      patient: {
        name: updated.patientName,
        age: updated.patientAge,
        medicalNotes: updated.medicalNotes,
        pickupLat,
        pickupLng,
      },
      ambulancePlate: nearest.ambulance.plateNumber,
    });

    // Persist notifications
    const notifPromises = [
      prisma.notification.create({
        data: {
          userId: updated.citizenId,
          requestId,
          type: 'sos_assigned',
          message: `Ambulance ${nearest.ambulance.plateNumber} is on its way. ETA: ${Math.round(etaSeconds / 60)} min`,
          channel: 'websocket',
        },
      }),
    ];
    if (nearest.ambulance.driverId) {
      notifPromises.push(
        prisma.notification.create({
          data: {
            userId: nearest.ambulance.driverId,
            requestId,
            type: 'new_request',
            message: `New emergency request at (${pickupLat.toFixed(4)}, ${pickupLng.toFixed(4)})`,
            channel: 'websocket',
          },
        })
      );
    }
    await Promise.all(notifPromises);

    return updated;
  },
};
