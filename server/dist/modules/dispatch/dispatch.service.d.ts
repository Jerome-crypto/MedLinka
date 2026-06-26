/**
 * Core dispatch algorithm:
 * 1. Find all available ambulances with known GPS position
 * 2. Compute Haversine distance from each ambulance to the pickup point
 * 3. Assign the nearest one
 * 4. Emit real-time events to driver, citizen, and the nearest hospital
 */
export declare const DispatchService: {
    dispatch(requestId: string, pickupLat: number, pickupLng: number, emergencyTypeName?: string): Promise<{
        hospital: {
            name: string;
            id: string;
            phone: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            lat: number;
            lng: number;
            address: string;
            capacity: number;
        } | null;
        ambulance: ({
            driver: {
                name: string;
                id: string;
                phone: string | null;
            } | null;
        } & {
            id: string;
            providerId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AmbulanceStatus;
            plateNumber: string;
            lat: number | null;
            lng: number | null;
            ambulanceType: string | null;
            equipmentLevel: number;
            driverId: string | null;
            assignedHospitalId: string | null;
        }) | null;
        citizen: {
            name: string;
            id: string;
            phone: string | null;
        };
    } & {
        id: string;
        hospitalId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RequestStatus;
        ambulanceId: string | null;
        pickupLat: number;
        pickupLng: number;
        pickupAddress: string | null;
        patientName: string | null;
        patientAge: number | null;
        medicalNotes: string | null;
        estimatedEta: number | null;
        citizenId: string;
        requestedAt: Date;
        dispatchedAt: Date | null;
        arrivedAt: Date | null;
        completedAt: Date | null;
        acknowledgedAt: Date | null;
    }>;
};
//# sourceMappingURL=dispatch.service.d.ts.map