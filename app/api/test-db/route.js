import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

export async function GET() {
  try {
    await prisma.$connect()
    return Response.json({ status: '✅ DB connection successful' })
  } catch (error) {
    return Response.json({ status: '❌ DB connection failed', error: error.message })
  }
}
