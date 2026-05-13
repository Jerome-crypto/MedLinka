-- AlterTable
ALTER TABLE "emergency_requests" ADD COLUMN     "acknowledged_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_reset_expiry" TIMESTAMP(3),
ADD COLUMN     "password_reset_token" TEXT;
