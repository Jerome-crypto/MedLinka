export declare const AmbulanceService: {
    list(page?: number, limit?: number): Promise<{
        ambulances: ({
            provider: {
                name: string;
                id: string;
            };
            driver: {
                name: string;
                id: string;
                phone: string | null;
            } | null;
            assignedHospital: {
                name: string;
                id: string;
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
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<{
        provider: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ProviderType;
            contactEmail: string | null;
            contactPhone: string | null;
            operatingStatus: boolean;
            address: string | null;
        };
        driver: {
            name: string;
            id: string;
            phone: string | null;
        } | null;
        assignedHospital: {
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
    }>;
    create(data: {
        plateNumber: string;
        providerId: string;
        assignedHospitalId?: string;
        ambulanceType?: string;
        equipmentLevel?: number;
        driverId?: string;
        lat?: number;
        lng?: number;
    }): Promise<{
        provider: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ProviderType;
            contactEmail: string | null;
            contactPhone: string | null;
            operatingStatus: boolean;
            address: string | null;
        };
        driver: {
            name: string;
            id: string;
        } | null;
        assignedHospital: {
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
    }>;
    updateStatus(id: string, status: "available" | "dispatched" | "offline" | "maintenance"): Promise<{
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
    }>;
    updateLocation(id: string, lat: number, lng: number, requestId?: string): Promise<{
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
    }>;
    delete(id: string): Promise<{
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
    }>;
    /** Driver updates their own ambulance status without knowing the ambulance ID */
    updateMyStatus(driverId: string, status: "available" | "dispatched" | "offline" | "maintenance"): Promise<{
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
    }>;
    assignDriver(id: string, driverId: string | null): Promise<{
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
    }>;
};
//# sourceMappingURL=ambulance.service.d.ts.map