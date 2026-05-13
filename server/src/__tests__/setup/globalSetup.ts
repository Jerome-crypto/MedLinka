import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run once before ALL test suites
export default async function globalSetup() {
  // Ensure the test DB is clean (use a test DB in real CI)
  // For development, we simply connect and verify
  await prisma.$connect();
  console.log('🧪 Test DB connected');
  await prisma.$disconnect();
}
