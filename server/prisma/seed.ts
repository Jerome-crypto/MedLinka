import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MedLinka database...');

  // ── Hospitals ─────────────────────────────────────────────────────
  const hospitalA = await prisma.hospital.upsert({
    where: { id: 'h-001' },
    update: {},
    create: {
      id: 'h-001',
      name: 'Entebbe Grade B Hospital',
      address: 'Kitooro Road, Entebbe',
      lat: 0.0613,
      lng: 32.4625,
      phone: '+256414320536',
      capacity: 120,
    },
  });

  const hospitalB = await prisma.hospital.upsert({
    where: { id: 'h-002' },
    update: {},
    create: {
      id: 'h-002',
      name: 'International Hospital Kampala',
      address: 'Plot 4686 Burnham Avenue, Kampala',
      lat: 0.3136,
      lng: 32.5811,
      phone: '+256414200400',
      capacity: 200,
    },
  });

  console.log('✅ Hospitals created');

  // ── Admin User ─────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '+256700000001' },
    update: {},
    create: {
      name: 'System Admin',
      phone: '+256700000001',
      email: 'admin@medlinka.ug',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });

  // ── Hospital Admin ─────────────────────────────────────────────────
  const hospitalAdminPwd = await bcrypt.hash('Hospital@1234', 10);
  const hospitalAdmin = await prisma.user.upsert({
    where: { phone: '+256700000002' },
    update: {},
    create: {
      name: 'Entebbe Hospital Admin',
      phone: '+256700000002',
      email: 'hospital@medlinka.ug',
      passwordHash: hospitalAdminPwd,
      role: 'hospital_admin',
    },
  });

  // ── Drivers ────────────────────────────────────────────────────────
  const driverPwd = await bcrypt.hash('Driver@1234', 10);
  const driver1 = await prisma.user.upsert({
    where: { phone: '+256700000010' },
    update: {},
    create: {
      name: 'John Mukasa',
      phone: '+256700000010',
      email: 'driver1@medlinka.ug',
      passwordHash: driverPwd,
      role: 'driver',
    },
  });

  const driver2 = await prisma.user.upsert({
    where: { phone: '+256700000011' },
    update: {},
    create: {
      name: 'Sarah Nalugo',
      phone: '+256700000011',
      email: 'driver2@medlinka.ug',
      passwordHash: driverPwd,
      role: 'driver',
    },
  });

  console.log('✅ Users created');

  // ── Ambulances ─────────────────────────────────────────────────────
  await prisma.ambulance.upsert({
    where: { plateNumber: 'UG-AMB-001' },
    update: {},
    create: {
      id: 'amb-001',
      plateNumber: 'UG-AMB-001',
      status: 'available',
      lat: 0.0550,
      lng: 32.4580,
      driverId: driver1.id,
      hospitalId: hospitalA.id,
    },
  });

  await prisma.ambulance.upsert({
    where: { plateNumber: 'UG-AMB-002' },
    update: {},
    create: {
      id: 'amb-002',
      plateNumber: 'UG-AMB-002',
      status: 'available',
      lat: 0.0700,
      lng: 32.4700,
      driverId: driver2.id,
      hospitalId: hospitalA.id,
    },
  });

  // ── Citizen ─────────────────────────────────────────────────────────
  const citizenPwd = await bcrypt.hash('Citizen@1234', 10);
  await prisma.user.upsert({
    where: { phone: '+256700000020' },
    update: {},
    create: {
      name: 'Alice Nakato',
      phone: '+256700000020',
      email: 'citizen@medlinka.ug',
      passwordHash: citizenPwd,
      role: 'citizen',
    },
  });

  console.log('✅ Ambulances + citizen created');
  console.log('\n📋 Seed credentials:');
  console.log('  Admin:    +256700000001 / Admin@1234');
  console.log('  Hospital: +256700000002 / Hospital@1234');
  console.log('  Driver 1: +256700000010 / Driver@1234');
  console.log('  Driver 2: +256700000011 / Driver@1234');
  console.log('  Citizen:  +256700000020 / Citizen@1234');
  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
