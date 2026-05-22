import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('Reading from SQLite...')
  const categories = await prisma.category.findMany()
  const products = await prisma.product.findMany()

  const data = { categories, products }
  fs.writeFileSync('data-dump.json', JSON.stringify(data, null, 2))
  
  console.log(`Saved ${categories.length} categories and ${products.length} products to data-dump.json`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
