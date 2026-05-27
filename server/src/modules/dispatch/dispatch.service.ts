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
  async dispatch(requestId: string, pickupLat: number, pickupLng: number, emergencyTypeName?: string) {
    // Determine required equipment level
    let requiredEquipmentLevel = 1;
    if (emergencyTypeName) {
      const et = await prisma.emergencyType.findUnique({ where: { name: emergencyTypeName } });
      if (et) requiredEquipmentLevel = et.requiredEquipmentLevel;
    }

    // Fetch all available ambulances with driver and provider info
    const ambulances = await prisma.ambulance.findMany({
      where: { status: 'available', lat: { not: null }, lng: { not: null } },
      include: { 
        driver: { select: { id: true, name: true, phone: true } }, 
        assignedHospital: true,
        provider: true
      },
    });

    if (ambulances.length === 0) {
      throw new AppError('No ambulances available at this time', 503);
    }

    // Score and rank ambulances based on distance and capabilities
    const ranked = ambulances
      .map((amb) => {
        const distanceKm = haversineDistance(amb.lat!, amb.lng!, pickupLat, pickupLng);
        const etaSeconds = estimateTravelTime(distanceKm);
        
        // Capability Score: +100 if it meets requirements, penalty if it doesn't
        let capabilityScore = 100;
        if (amb.equipmentLevel < requiredEquipmentLevel) {
          capabilityScore = 0; // Huge penalty for insufficient equipment
        } else if (amb.equipmentLevel > requiredEquipmentLevel) {
          capabilityScore += 20; // Bonus for advanced equipment
        }

        // ETA Score: 100 points max, minus 1 point per 30 seconds of ETA
        const etaScore = Math.max(0, 100 - (etaSeconds / 30));
        
        // Total Score
        const totalScore = capabilityScore + etaScore;

        return {
          ambulance: amb,
          distanceKm,
          etaSeconds,
          totalScore,
        };
      })
      // Must have capability > 0, then sort by highest total score
      .filter((a) => a.totalScore > 0)
      .sort((a, b) => b.totalScore - a.totalScore);

    const nearest = ranked[0];
    const etaSeconds = nearest.etaSeconds;

    // Determine the hospital to notify (assigned hospital, or find nearest hospital if null)
    let targetHospitalId = nearest.ambulance.assignedHospitalId;
    if (!targetHospitalId) {
      // If it's a private/NGO ambulance without a base hospital, route them to the nearest hospital
      const allHospitals = await prisma.hospital.findMany();
      if (allHospitals.length > 0) {
        const nearestHosp = allHospitals
          .map(h => ({ id: h.id, dist: haversineDistance(pickupLat, pickupLng, h.lat, h.lng) }))
          .sort((a, b) => a.dist - b.dist)[0];
        targetHospitalId = nearestHosp.id;
      }
    }

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
        hospitalId: targetHospitalId,
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

    // Notify hospital (the target hospital where patient will be delivered)
    if (targetHospitalId) {
      io.to(`hospital:${targetHospitalId}`).emit('hospital:incoming', {
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
        providerName: nearest.ambulance.provider.name,
      });
    }

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
