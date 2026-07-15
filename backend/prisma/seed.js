// =============================================================================
// prisma/seed.js – Database Seeder
// =============================================================================
// Creates the initial ADMIN user. This is intentionally the ONLY way to create
// an admin account – there is no public registration endpoint for admins.
//
// Run with: npx prisma db seed
// =============================================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ---------------------------------------------------------------------------
  // Seed Admin User
  // ---------------------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@taskforge.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@TaskForge123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Platform',
        lastName: 'Admin',
        role: 'ADMIN',
        isEmailVerified: true, // Admin is pre-verified
      },
    });

    console.log(`✅ Admin user created successfully:`);
    console.log(`   Email   : ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role    : ${admin.role}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');
  }

  console.log('🌱 Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
