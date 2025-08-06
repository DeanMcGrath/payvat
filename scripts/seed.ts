import { PrismaClient } from '../lib/generated/prisma'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await hashPassword('demo123456')
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@payvat.ie' },
    update: {},
    create: {
      email: 'demo@payvat.ie',
      password: hashedPassword,
      businessName: 'Brian Cusack Trading Ltd',
      vatNumber: 'IE0352440A',
      firstName: 'Brian',
      lastName: 'Cusack',
      phone: '+353 1 234 5678',
      role: 'USER',
    }
  })
  
  // Create admin user
  const adminHashedPassword = await hashPassword('admin123456')
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@payvat.ie' },
    update: {},
    create: {
      email: 'admin@payvat.ie',
      password: adminHashedPassword,
      businessName: 'PAY VAT Administration',
      vatNumber: 'IE9999999AA',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    }
  })
  
  console.log('Database seeded successfully!')
  console.log('Demo user:', demoUser.email)
  console.log('Admin user:', adminUser.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })