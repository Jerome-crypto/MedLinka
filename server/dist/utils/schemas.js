"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHospitalSchema = exports.UpdateLocationSchema = exports.CreateAmbulanceSchema = exports.UpdateSosStatusSchema = exports.CreateSosSchema = exports.RefreshSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
// ── Auth schemas ────────────────────────────────────────────────────
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format'),
    email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters').max(128),
    role: zod_1.z.enum(['citizen', 'driver', 'hospital_admin', 'admin']).optional(),
});
exports.LoginSchema = zod_1.z.object({
    phone: zod_1.z.string().trim().min(1, 'Phone is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.RefreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
// ── SOS schemas ─────────────────────────────────────────────────────
exports.CreateSosSchema = zod_1.z.object({
    pickupLat: zod_1.z.number().min(-90).max(90),
    pickupLng: zod_1.z.number().min(-180).max(180),
    pickupAddress: zod_1.z.string().max(500).optional(),
    patientName: zod_1.z.string().max(100).trim().optional(),
    patientAge: zod_1.z.number().int().min(0).max(150).optional(),
    medicalNotes: zod_1.z.string().max(1000).trim().optional(),
});
exports.UpdateSosStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['in_progress', 'arrived', 'completed', 'cancelled']),
});
// ── Ambulance schemas ───────────────────────────────────────────────
exports.CreateAmbulanceSchema = zod_1.z.object({
    plateNumber: zod_1.z.string().min(3).max(20).trim(),
    hospitalId: zod_1.z.string().uuid('Invalid hospital ID'),
    driverId: zod_1.z.string().uuid().optional(),
    lat: zod_1.z.number().min(-90).max(90).optional(),
    lng: zod_1.z.number().min(-180).max(180).optional(),
});
exports.UpdateLocationSchema = zod_1.z.object({
    lat: zod_1.z.number().min(-90).max(90),
    lng: zod_1.z.number().min(-180).max(180),
    requestId: zod_1.z.string().uuid().optional(),
});
// ── Hospital schemas ────────────────────────────────────────────────
exports.CreateHospitalSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200).trim(),
    address: zod_1.z.string().min(5).max(500).trim(),
    lat: zod_1.z.number().min(-90).max(90),
    lng: zod_1.z.number().min(-180).max(180),
    phone: zod_1.z.string().regex(/^\+?[0-9]{9,15}$/),
    capacity: zod_1.z.number().int().min(1).max(10000).optional(),
});
//# sourceMappingURL=schemas.js.map