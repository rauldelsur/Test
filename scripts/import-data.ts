import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const data = JSON.parse(fs.readFileSync('data-dump.json', 'utf-8'))
  const { categories, products } = data

  console.log(`Starting import into Postgres...`)

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    })
  }
  console.log(`Imported ${categories.length} categories.`)

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod,
    })
  }
  console.log(`Imported ${products.length} products.`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
