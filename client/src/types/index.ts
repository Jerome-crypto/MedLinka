// ─────────────────────────────────────────────────────────────────
// MedLinka Shared Types
// ─────────────────────────────────────────────────────────────────

export type Role = 'citizen' | 'driver' | 'hospital_admin' | 'provider_manager' | 'admin';
export type AmbulanceStatus = 'available' | 'dispatched' | 'offline' | 'maintenance';
export type RequestStatus =
  | 'pending'
  | 'dispatched'
  | 'in_progress'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  providerId?: string;
  hospitalId?: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  capacity: number;
}

export interface Ambulance {
  id: string;
  plateNumber: string;
  status: AmbulanceStatus;
  lat?: number;
  lng?: number;
  driverId?: string;
  driver?: Pick<User, 'id' | 'name' | 'phone'>;
  hospital?: Hospital;
  hospitalId: string;
}

export interface EmergencyRequest {
  id: string;
  status: RequestStatus;
  pickupLat: number;
  pickupLng: number;
  pickupAddress?: string;
  patientName?: string;
  patientAge?: number;
  medicalNotes?: string;
  estimatedEta?: number;
  citizenId: string;
  citizen?: Pick<User, 'id' | 'name' | 'phone'>;
  ambulanceId?: string;
  ambulance?: Ambulance;
  hospitalId?: string;
  hospital?: Hospital;
  requestedAt: string;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  channel: string;
  isRead: boolean;
  sentAt: string;
  requestId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Socket event payloads
export interface SosAssignedEvent {
  requestId: string;
  ambulance: {
    plateNumber: string;
    driver?: Pick<User, 'id' | 'name' | 'phone'>;
    lat?: number;
    lng?: number;
  };
  etaSeconds: number;
  hospital?: Hospital;
}

export interface LocationUpdateEvent {
  ambulanceId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface StatusUpdateEvent {
  requestId: string;
  status: RequestStatus;
  timestamp: string;
}

export interface NewRequestEvent {
  requestId: string;
  pickupLat: number;
  pickupLng: number;
  citizen?: Pick<User, 'id' | 'name' | 'phone'>;
  medicalNotes?: string;
  patientName?: string;
}

export interface HospitalIncomingEvent {
  requestId: string;
  etaSeconds: number;
  patient: {
    name?: string;
    age?: number;
    medicalNotes?: string;
    pickupLat: number;
    pickupLng: number;
  };
  ambulancePlate: string;
}
