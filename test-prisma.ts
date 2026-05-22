import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const p = await prisma.product.findMany({
    where: { name: { contains: 'a', mode: 'insensitive' } }
  })
  console.log(p.length)
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
