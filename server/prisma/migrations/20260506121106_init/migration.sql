-- CreateEnum
CREATE TYPE "Role" AS ENUM ('citizen', 'driver', 'hospital_admin', 'admin');

-- CreateEnum
CREATE TYPE "AmbulanceStatus" AS ENUM ('available', 'dispatched', 'offline', 'maintenance');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'dispatched', 'in_progress', 'arrived', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('push', 'sms', 'websocket', 'email');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'citizen',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 50,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambulances" (
    "id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "status" "AmbulanceStatus" NOT NULL DEFAULT 'available',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "driver_id" TEXT,
    "hospital_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambulances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_requests" (
    "id" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "pickup_lat" DOUBLE PRECISION NOT NULL,
    "pickup_lng" DOUBLE PRECISION NOT NULL,
    "pickup_address" TEXT,
    "patient_name" TEXT,
    "patient_age" INTEGER,
    "medical_notes" TEXT,
    "estimated_eta" INTEGER,
    "citizen_id" TEXT NOT NULL,
    "ambulance_id" TEXT,
    "hospital_id" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatched_at" TIMESTAMP(3),
    "arrived_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_logs" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ambulance_id" TEXT NOT NULL,
    "request_id" TEXT,

    CONSTRAINT "location_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'websocket',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_id" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ambulances_plate_number_key" ON "ambulances"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "ambulances_driver_id_key" ON "ambulances"("driver_id");

-- AddForeignKey
ALTER TABLE "ambulances" ADD CONSTRAINT "ambulances_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulances" ADD CONSTRAINT "ambulances_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_ambulance_id_fkey" FOREIGN KEY ("ambulance_id") REFERENCES "ambulances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_requests" ADD CONSTRAINT "emergency_requests_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_logs" ADD CONSTRAINT "location_logs_ambulance_id_fkey" FOREIGN KEY ("ambulance_id") REFERENCES "ambulances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_logs" ADD CONSTRAINT "location_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "emergency_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "emergency_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
