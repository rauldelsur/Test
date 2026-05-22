import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.dkhwrkayjpacmrdrebxd:%23_tDQk!J7b4u9y_@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
    }
  }
})
async function main() {
  try {
    const res = await Promise.all([
      prisma.project.count(),
      prisma.quote.count(),
      prisma.product.count(),
      prisma.client.count(),
      prisma.quote.findMany({ take: 5 }),
      prisma.quote.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.companySettings.findFirst()
    ])
    console.log("Success:", res)
  } catch (e) {
    console.error("Database error:", e)
  }
}
main().finally(() => prisma.$disconnect())
