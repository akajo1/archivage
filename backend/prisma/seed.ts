import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // System roles
  await prisma.appRole.upsert({
    where: { key: 'admin' },
    update: { name: 'Administrateur' },
    create: { key: 'admin', name: 'Administrateur' },
  });
  await prisma.appRole.upsert({
    where: { key: 'manager' },
    update: { name: 'Manager' },
    create: { key: 'manager', name: 'Manager' },
  });
  await prisma.appRole.upsert({
    where: { key: 'user' },
    update: { name: 'Utilisateur' },
    create: { key: 'user', name: 'Utilisateur' },
  });
  console.log('✅ System roles created');

  // Badges
  const badgeCritique = await prisma.badge.upsert({
    where: { name: 'critique' },
    update: {},
    create: { name: 'critique', color: '#ef4444' },
  });
  const badgeNormal = await prisma.badge.upsert({
    where: { name: 'normal' },
    update: {},
    create: { name: 'normal', color: '#3b82f6' },
  });
  const badgeFaible = await prisma.badge.upsert({
    where: { name: 'faible' },
    update: {},
    create: { name: 'faible', color: '#6b7280' },
  });
  console.log('✅ Badges created');

  // Confidentiality levels
  const cPublic = await prisma.confidentiality.upsert({
    where: { level: 'public' },
    update: {},
    create: { level: 'public' },
  });
  const cInterne = await prisma.confidentiality.upsert({
    where: { level: 'interne' },
    update: {},
    create: { level: 'interne' },
  });
  const cConfidentiel = await prisma.confidentiality.upsert({
    where: { level: 'confidentiel' },
    update: {},
    create: { level: 'confidentiel' },
  });
  const cSecret = await prisma.confidentiality.upsert({
    where: { level: 'secret' },
    update: {},
    create: { level: 'secret' },
  });
  console.log('✅ Confidentiality levels created');

  // Default role permissions
  await prisma.rolePermission.upsert({
    where: { role: 'admin' },
    update: {
      badges: {
        set: [badgeCritique.id, badgeNormal.id, badgeFaible.id].map((id) => ({ id })),
      },
      confidentialities: {
        set: [cPublic.id, cInterne.id, cConfidentiel.id, cSecret.id].map((id) => ({ id })),
      },
      canRead: true,
      canCreate: true,
      canEdit: true,
    },
    create: {
      role: 'admin',
      badges: {
        connect: [badgeCritique.id, badgeNormal.id, badgeFaible.id].map((id) => ({ id })),
      },
      confidentialities: {
        connect: [cPublic.id, cInterne.id, cConfidentiel.id, cSecret.id].map((id) => ({ id })),
      },
      canRead: true,
      canCreate: true,
      canEdit: true,
    },
  });

  await prisma.rolePermission.upsert({
    where: { role: 'manager' },
    update: {
      badges: {
        set: [badgeCritique.id, badgeNormal.id, badgeFaible.id].map((id) => ({ id })),
      },
      confidentialities: {
        set: [cPublic.id, cInterne.id, cConfidentiel.id].map((id) => ({ id })),
      },
      canRead: true,
      canCreate: true,
      canEdit: true,
    },
    create: {
      role: 'manager',
      badges: {
        connect: [badgeCritique.id, badgeNormal.id, badgeFaible.id].map((id) => ({ id })),
      },
      confidentialities: {
        connect: [cPublic.id, cInterne.id, cConfidentiel.id].map((id) => ({ id })),
      },
      canRead: true,
      canCreate: true,
      canEdit: true,
    },
  });

  await prisma.rolePermission.upsert({
    where: { role: 'user' },
    update: {
      badges: {
        set: [badgeNormal.id, badgeFaible.id].map((id) => ({ id })),
      },
      confidentialities: {
        set: [cPublic.id].map((id) => ({ id })),
      },
      canRead: true,
      canCreate: false,
      canEdit: false,
    },
    create: {
      role: 'user',
      badges: {
        connect: [badgeNormal.id, badgeFaible.id].map((id) => ({ id })),
      },
      confidentialities: {
        connect: [cPublic.id].map((id) => ({ id })),
      },
      canRead: true,
      canCreate: false,
      canEdit: false,
    },
  });
  console.log('✅ Default role permissions created');

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@archivage.fr' },
    update: { name: 'Admin', role: 'admin', password: hashedPassword },
    create: { name: 'Admin', email: 'admin@archivage.fr', password: hashedPassword, role: 'admin' },
  });
  console.log('✅ Admin user: admin@archivage.fr / admin123');

  // Manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  await prisma.user.upsert({
    where: { email: 'manager@archivage.fr' },
    update: { name: 'Manager', role: 'manager', password: managerPassword },
    create: { name: 'Manager', email: 'manager@archivage.fr', password: managerPassword, role: 'manager' },
  });
  console.log('✅ Manager user: manager@archivage.fr / manager123');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

