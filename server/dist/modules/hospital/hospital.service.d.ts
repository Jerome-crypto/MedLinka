export declare const HospitalService: {
    list(): Promise<({
        _count: {
            requests: number;
        };
        ambulances: {
            id: string;
            status: import(".prisma/client").$Enums.AmbulanceStatus;
            plateNumber: string;
        }[];
    } & {
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
    })[]>;
    getById(id: string): Promise<{
        ambulances: ({
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
        })[];
    } & {
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
    }>;
    create(data: {
        name: string;
        address: string;
        lat: number;
        lng: number;
        phone: string;
        capacity?: number;
    }): Promise<{
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
    }>;
    update(id: string, data: Partial<{
        name: string;
        address: string;
        lat: number;
        lng: number;
        phone: string;
        capacity: number;
        isActive: boolean;
    }>): Promise<{
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
    }>;
    /** Get the hospital for a logged-in hospital_admin */
    getMyHospital(userId: string, hospitalIdFromToken?: string | null): Promise<{
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
    }>;
    /** Incoming patients for a hospital dashboard */
    getIncomingPatients(hospitalId: string): Promise<({
        ambulance: {
            driver: {
                name: string;
                phone: string | null;
            } | null;
            plateNumber: string;
            lat: number | null;
            lng: number | null;
        } | null;
        citizen: {
            name: string;
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
    })[]>;
};
//# sourceMappingURL=hospital.service.d.ts.map