import { z } from 'zod';

// ── Auth schemas ────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  role: z.enum(['citizen', 'driver', 'hospital_admin', 'admin']).optional(),
});

export const LoginSchema = z.object({
  phone: z.string().trim().min(1, 'Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ── SOS schemas ─────────────────────────────────────────────────────
export const CreateSosSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  pickupAddress: z.string().max(500).optional(),
  patientName: z.string().max(100).trim().optional(),
  patientAge: z.number().int().min(0).max(150).optional(),
  medicalNotes: z.string().max(1000).trim().optional(),
});

export const UpdateSosStatusSchema = z.object({
  status: z.enum(['in_progress', 'arrived', 'completed', 'cancelled']),
});

// ── Ambulance schemas ───────────────────────────────────────────────
export const CreateAmbulanceSchema = z.object({
  plateNumber: z.string().min(3).max(20).trim(),
  hospitalId: z.string().uuid('Invalid hospital ID'),
  driverId: z.string().uuid().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const UpdateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  requestId: z.string().uuid().optional(),
});

// ── Hospital schemas ────────────────────────────────────────────────
export const CreateHospitalSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  address: z.string().min(5).max(500).trim(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/),
  capacity: z.number().int().min(1).max(10000).optional(),
});
