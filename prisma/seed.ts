import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  // Create sample keywords
  const keywords = [
    {
      name: 'artificial intelligence',
      description: 'AI and machine learning content',
      createdBy: adminUser.id,
    },
    {
      name: 'web development',
      description: 'Modern web development practices and tools',
      createdBy: adminUser.id,
    },
    {
      name: 'design',
      description: 'UI/UX design inspiration and tutorials',
      createdBy: adminUser.id,
    },
  ]

  for (const keyword of keywords) {
    await prisma.keyword.upsert({
      where: { name: keyword.name },
      update: {},
      create: keyword,
    })
  }

  // Create sample source configs
  const sources = [
    { domain: 'github.com', isAllowed: true, rateLimit: 5000 },
    { domain: 'dev.to', isAllowed: true, rateLimit: 2000 },
    { domain: 'medium.com', isAllowed: true, rateLimit: 1000 },
    { domain: 'dribbble.com', isAllowed: true, rateLimit: 2000 },
    { domain: 'behance.net', isAllowed: true, rateLimit: 2000 },
    { domain: 'twitter.com', isAllowed: true, rateLimit: 1000 },
  ]

  for (const source of sources) {
    await prisma.sourceConfig.upsert({
      where: { domain: source.domain },
      update: {},
      create: source,
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`Admin user created: ${adminUser.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
