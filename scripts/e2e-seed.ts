/**
 * E2E Test Seeding Script
 * Creates admin user and test data for end-to-end testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedE2ETestData() {
  try {
    console.log('🌱 Seeding E2E test data...');

    // Create admin user for testing
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'testpassword123';
    
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: 'E2E Test Admin',
        role: 'ADMIN',
      },
    });

    console.log(`✅ Admin user created/updated: ${adminUser.email}`);

    // Clear any existing test keywords
    await prisma.keyword.deleteMany({
      where: {
        OR: [
          { name: { startsWith: 'test' } },
          { name: { startsWith: 'e2e' } },
        ]
      }
    });

    console.log('✅ Cleared existing test keywords');

    // Create some test keywords
    const testKeywords = [
      {
        name: 'test keyword 1',
        description: 'E2E test keyword 1',
        isActive: true,
        createdBy: adminUser.id,
      },
      {
        name: 'test keyword 2',
        description: 'E2E test keyword 2',
        isActive: true,
        createdBy: adminUser.id,
      },
    ];

    for (const keyword of testKeywords) {
      await prisma.keyword.upsert({
        where: { name: keyword.name },
        update: keyword,
        create: keyword,
      });
    }

    console.log('✅ Created test keywords');

    console.log('🎉 E2E test data seeding completed successfully!');
    console.log(`📧 Admin login: ${adminEmail}`);
    console.log(`🔑 Admin password: ${adminPassword}`);

  } catch (error) {
    console.error('❌ Error seeding E2E test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedE2ETestData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedE2ETestData };
