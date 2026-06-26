export declare const ProviderService: {
    list(): Promise<({
        _count: {
            ambulances: number;
            users: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ProviderType;
        contactEmail: string | null;
        contactPhone: string | null;
        operatingStatus: boolean;
        address: string | null;
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
        users: {
            name: string;
            id: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ProviderType;
        contactEmail: string | null;
        contactPhone: string | null;
        operatingStatus: boolean;
        address: string | null;
    }>;
    create(data: {
        name: string;
        type: "hospital" | "private" | "ngo" | "government";
        contactEmail?: string;
        contactPhone?: string;
        address?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ProviderType;
        contactEmail: string | null;
        contactPhone: string | null;
        operatingStatus: boolean;
        address: string | null;
    }>;
    update(id: string, data: Partial<{
        name: string;
        type: "hospital" | "private" | "ngo" | "government";
        contactEmail: string;
        contactPhone: string;
        address: string;
        operatingStatus: boolean;
    }>): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.ProviderType;
        contactEmail: string | null;
        contactPhone: string | null;
        operatingStatus: boolean;
        address: string | null;
    }>;
    getFleetStatus(providerId: string): Promise<{
        summary: {
            total: number;
            available: number;
            dispatched: number;
            offline: number;
            maintenance: number;
        };
        ambulances: ({
            driver: {
                name: string;
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
    }>;
};
//# sourceMappingURL=provider.service.d.ts.map