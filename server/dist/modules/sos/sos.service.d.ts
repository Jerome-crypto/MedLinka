interface CreateSosDto {
    citizenId: string;
    pickupLat: number;
    pickupLng: number;
    pickupAddress?: string;
    patientName?: string;
    patientAge?: number;
    medicalNotes?: string;
}
export declare const SosService: {
    /** Create a new SOS request and immediately trigger dispatch */
    create(dto: CreateSosDto): Promise<{
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
    /** Get single request with full relations */
    getById(requestId: string, userId: string, userRole: string): Promise<{
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
    /** List requests — filtered by role */
    list(userId: string, userRole: string, page?: number, limit?: number): Promise<{
        requests: ({
            hospital: {
                name: string;
            } | null;
            ambulance: {
                driver: {
                    name: string;
                } | null;
                plateNumber: string;
            } | null;
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /** Driver / admin update request status */
    updateStatus(requestId: string, status: "in_progress" | "arrived" | "completed" | "cancelled", userId: string, userRole: string): Promise<{
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
    /** Citizen cancel their own pending request */
    cancel(requestId: string, citizenId: string): Promise<{
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
    /** Hospital admin acknowledges incoming patient — marks bed ready */
    acknowledge(requestId: string, _userId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        acknowledgedAt: Date | null;
    }>;
    createDirectTransport(dto: {
        driverId: string;
        hospitalId: string;
        pickupLat: number;
        pickupLng: number;
        pickupAddress?: string;
        patientName?: string;
        patientAge?: number;
        medicalNotes?: string;
    }): Promise<{
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
export {};
//# sourceMappingURL=sos.service.d.ts.map