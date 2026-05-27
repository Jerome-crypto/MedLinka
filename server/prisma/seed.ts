import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MedLinka database...');

  console.log('🧹 Cleaning database...');
  await prisma.locationLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.emergencyRequest.deleteMany({});
  await prisma.ambulance.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.providerCoverageZone.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.hospital.deleteMany({});
  await prisma.emergencyType.deleteMany({});
  console.log('✅ Database cleaned');

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

  // ── Emergency Types ───────────────────────────────────────────────
  await prisma.emergencyType.upsert({
    where: { name: 'Trauma' }, update: {},
    create: { name: 'Trauma', requiredEquipmentLevel: 2 },
  });
  await prisma.emergencyType.upsert({
    where: { name: 'Maternal' }, update: {},
    create: { name: 'Maternal', requiredEquipmentLevel: 1 },
  });
  console.log('✅ Emergency Types created');

  // ── Providers ─────────────────────────────────────────────────────
  const govProvider = await prisma.provider.upsert({
    where: { id: 'prov-001' }, update: {},
    create: {
      id: 'prov-001',
      name: 'Entebbe Grade B Hospital EMS',
      type: 'hospital',
      contactEmail: 'ems@entebbehospital.ug',
      contactPhone: '+256414320536',
    },
  });

  const ngoProvider = await prisma.provider.upsert({
    where: { id: 'prov-002' }, update: {},
    create: {
      id: 'prov-002',
      name: 'Uganda Red Cross EMS',
      type: 'ngo',
      contactEmail: 'ems@redcrossug.org',
      contactPhone: '+256414258564',
    },
  });

  console.log('✅ Providers created');

  // ── Admin User ─────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medlinka.com' },
    update: {},
    create: {
      name: 'System Admin',
      phone: '+256700000001',
      email: 'admin@medlinka.com',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });

  // ── Hospital Admin ─────────────────────────────────────────────────
  const hospitalAdminPwd = await bcrypt.hash('Hospital@1234', 10);
  const hospitalAdmin = await prisma.user.upsert({
    where: { email: 'hospital@medlinka.com' },
    update: {
      hospitalId: hospitalA.id,
    },
    create: {
      name: 'Entebbe Hospital Admin',
      phone: '+256700000002',
      email: 'hospital@medlinka.com',
      passwordHash: hospitalAdminPwd,
      role: 'hospital_admin',
      hospitalId: hospitalA.id,
    },
  });

  // ── Provider Manager ────────────────────────────────────────────────
  const providerManagerPwd = await bcrypt.hash('Provider@1234', 10);
  const providerManager = await prisma.user.upsert({
    where: { email: 'manager@redcrossug.org' },
    update: {
      providerId: ngoProvider.id,
    },
    create: {
      name: 'Red Cross Fleet Manager',
      phone: '+256700000003',
      email: 'manager@redcrossug.org',
      passwordHash: providerManagerPwd,
      role: 'provider_manager',
      providerId: ngoProvider.id,
    },
  });

  // ── Drivers ────────────────────────────────────────────────────────
  const driverPwd = await bcrypt.hash('Driver@1234', 10);
  const driver1 = await prisma.user.upsert({
    where: { email: 'driver1@medlinka.com' },
    update: {
      providerId: govProvider.id,
    },
    create: {
      name: 'John Mukasa',
      phone: '+256700000010',
      email: 'driver1@medlinka.com',
      passwordHash: driverPwd,
      role: 'driver',
      providerId: govProvider.id,
    },
  });

  const driver2 = await prisma.user.upsert({
    where: { email: 'driver2@medlinka.com' },
    update: {
      providerId: ngoProvider.id,
    },
    create: {
      name: 'Sarah Nalugo',
      phone: '+256700000011',
      email: 'driver2@medlinka.com',
      passwordHash: driverPwd,
      role: 'driver',
      providerId: ngoProvider.id,
    },
  });

  console.log('✅ Users created');

  // ── Ambulances ─────────────────────────────────────────────────────
  await prisma.ambulance.upsert({
    where: { plateNumber: 'UG-AMB-001' },
    update: {
      driverId: driver1.id,
    },
    create: {
      id: 'amb-001',
      plateNumber: 'UG-AMB-001',
      status: 'available',
      lat: 0.0550,
      lng: 32.4580,
      driverId: driver1.id,
      providerId: govProvider.id,
      assignedHospitalId: hospitalA.id,
      ambulanceType: 'Basic Life Support',
      equipmentLevel: 1,
    },
  });

  await prisma.ambulance.upsert({
    where: { plateNumber: 'UG-AMB-002' },
    update: {
      driverId: driver2.id,
    },
    create: {
      id: 'amb-002',
      plateNumber: 'UG-AMB-002',
      status: 'available',
      lat: 0.0700,
      lng: 32.4700,
      driverId: driver2.id,
      providerId: ngoProvider.id,
      assignedHospitalId: null, // NGO ambulance, not stationed at hospital
      ambulanceType: 'Advanced Life Support',
      equipmentLevel: 2,
    },
  });

  // ── Citizen ─────────────────────────────────────────────────────────
  const citizenPwd = await bcrypt.hash('Citizen@1234', 10);
  await prisma.user.upsert({
    where: { email: 'alice@medlinka.com' },
    update: {},
    create: {
      name: 'Alice Nakato',
      phone: '+256700000020',
      email: 'alice@medlinka.com',
      passwordHash: citizenPwd,
      role: 'citizen',
    },
  });

  console.log('✅ Ambulances + citizen created');
  console.log('\n📋 Seed credentials:');
  console.log('  Admin:    admin@medlinka.com / Admin@1234');
  console.log('  Hospital: hospital@medlinka.com / Hospital@1234');
  console.log('  Provider: manager@redcrossug.org / Provider@1234');
  console.log('  Driver 1: driver1@medlinka.com / Driver@1234');
  console.log('  Driver 2: driver2@medlinka.com / Driver@1234');
  console.log('  Citizen:  alice@medlinka.com / Citizen@1234');
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
