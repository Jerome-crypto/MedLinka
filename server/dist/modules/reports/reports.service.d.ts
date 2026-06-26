export declare const ReportsService: {
    /** Overall dashboard stats */
    stats(): Promise<{
        requests: {
            total: number;
            active: number;
            completed: number;
            cancelled: number;
        };
        ambulances: {
            total: number;
            available: number;
            dispatched: number;
        };
        hospitals: number;
        citizens: number;
    }>;
    /** Average response time (dispatched_at - requested_at) in seconds */
    avgResponseTime(): Promise<{
        avgSeconds: number;
        count: number;
    }>;
    /** Requests per day (last 30 days) */
    requestsPerDay(): Promise<{
        date: string;
        count: number;
        completed: number;
    }[]>;
    /** Requests per weekday (last 7 days) — replaces MOCK_BAR */
    requestsThisWeek(): Promise<{
        day: string;
        vol: number;
    }[]>;
    /** Peak hour and most common emergency type — replaces hardcoded KPI cards */
    analytics(): Promise<{
        peakHour: string;
        commonType: string;
        totalCount: number;
    }>;
    /** Activity feed — last N significant events */
    activityFeed(limit?: number): Promise<{
        text: string;
        color: string;
        time: string;
    }[]>;
    /** Ambulance utilisation */
    ambulanceUtilisation(): Promise<{
        id: string;
        _count: {
            requests: number;
        };
        status: import(".prisma/client").$Enums.AmbulanceStatus;
        plateNumber: string;
    }[]>;
    /** Recent requests for export */
    recentRequests(limit?: number): Promise<({
        hospital: {
            name: string;
        } | null;
        ambulance: {
            plateNumber: string;
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
//# sourceMappingURL=reports.service.d.ts.map