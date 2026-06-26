import { z } from 'zod';
export declare const RegisterSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["citizen", "driver", "hospital_admin", "admin"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    password: string;
    email?: string | undefined;
    role?: "citizen" | "driver" | "hospital_admin" | "admin" | undefined;
}, {
    name: string;
    phone: string;
    password: string;
    email?: string | undefined;
    role?: "citizen" | "driver" | "hospital_admin" | "admin" | undefined;
}>;
export declare const LoginSchema: z.ZodObject<{
    phone: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    password: string;
}, {
    phone: string;
    password: string;
}>;
export declare const RefreshSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const CreateSosSchema: z.ZodObject<{
    pickupLat: z.ZodNumber;
    pickupLng: z.ZodNumber;
    pickupAddress: z.ZodOptional<z.ZodString>;
    patientName: z.ZodOptional<z.ZodString>;
    patientAge: z.ZodOptional<z.ZodNumber>;
    medicalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pickupLat: number;
    pickupLng: number;
    pickupAddress?: string | undefined;
    patientName?: string | undefined;
    patientAge?: number | undefined;
    medicalNotes?: string | undefined;
}, {
    pickupLat: number;
    pickupLng: number;
    pickupAddress?: string | undefined;
    patientName?: string | undefined;
    patientAge?: number | undefined;
    medicalNotes?: string | undefined;
}>;
export declare const UpdateSosStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["in_progress", "arrived", "completed", "cancelled"]>;
}, "strip", z.ZodTypeAny, {
    status: "in_progress" | "arrived" | "completed" | "cancelled";
}, {
    status: "in_progress" | "arrived" | "completed" | "cancelled";
}>;
export declare const CreateAmbulanceSchema: z.ZodObject<{
    plateNumber: z.ZodString;
    hospitalId: z.ZodString;
    driverId: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    hospitalId: string;
    plateNumber: string;
    lat?: number | undefined;
    lng?: number | undefined;
    driverId?: string | undefined;
}, {
    hospitalId: string;
    plateNumber: string;
    lat?: number | undefined;
    lng?: number | undefined;
    driverId?: string | undefined;
}>;
export declare const UpdateLocationSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    requestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
    requestId?: string | undefined;
}, {
    lat: number;
    lng: number;
    requestId?: string | undefined;
}>;
export declare const CreateHospitalSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodString;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    phone: z.ZodString;
    capacity: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    lat: number;
    lng: number;
    address: string;
    capacity?: number | undefined;
}, {
    name: string;
    phone: string;
    lat: number;
    lng: number;
    address: string;
    capacity?: number | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map