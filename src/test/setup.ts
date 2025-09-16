import { beforeAll, afterAll, beforeEach } from 'vitest'
import { db } from '../lib/db'

beforeAll(async () => {
  // Setup test database
})

afterAll(async () => {
  // Cleanup test database
  await db.$disconnect()
})

beforeEach(async () => {
  // Clean up data between tests
  await db.post.deleteMany()
  await db.keyword.deleteMany()
  await db.user.deleteMany()
})
