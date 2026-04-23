import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Badges
  await prisma.badge.upsert({ where: { name: 'critique' }, update: {}, create: { name: 'critique', color: '#ef4444' } });
  await prisma.badge.upsert({ where: { name: 'normal' }, update: {}, create: { name: 'normal', color: '#3b82f6' } });
  await prisma.badge.upsert({ where: { name: 'faible' }, update: {}, create: { name: 'faible', color: '#6b7280' } });
  console.log('✅ Badges created');

  // Confidentiality levels
  await prisma.confidentiality.upsert({ where: { level: 'public' }, update: {}, create: { level: 'public' } });
  await prisma.confidentiality.upsert({ where: { level: 'interne' }, update: {}, create: { level: 'interne' } });
  await prisma.confidentiality.upsert({ where: { level: 'confidentiel' }, update: {}, create: { level: 'confidentiel' } });
  await prisma.confidentiality.upsert({ where: { level: 'secret' }, update: {}, create: { level: 'secret' } });
  console.log('✅ Confidentiality levels created');

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@archivage.fr' },
    update: {},
    create: { name: 'Admin', email: 'admin@archivage.fr', password: hashedPassword, role: 'admin' },
  });
  console.log('✅ Admin user: admin@archivage.fr / admin123');

  // Manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  await prisma.user.upsert({
    where: { email: 'manager@archivage.fr' },
    update: {},
    create: { name: 'Manager', email: 'manager@archivage.fr', password: managerPassword, role: 'manager' },
  });
  console.log('✅ Manager user: manager@archivage.fr / manager123');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

