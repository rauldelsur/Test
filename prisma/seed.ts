import { PrismaClient } from '@prisma/client'
import productsData from '../download/products.json'

const prisma = new PrismaClient()

const categoryMap: Record<string, string> = {
  'inoxidable': 'Inoxidable',
  'hierro': 'Hierro',
  'inoxidable 316': 'Inoxidable 316',
  'galvanizado': 'Galvanizado',
}

async function main() {
  console.log('Seeding database...')

  // Create categories
  const categories: Record<string, string> = {}
  for (const [key, name] of Object.entries(categoryMap)) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    categories[key] = category.id
    console.log(`Created category: ${name}`)
  }

  // Create products
  for (const p of productsData) {
    const categoryId = categories[p.categoria]
    if (!categoryId) {
      console.warn(`Category not found for product ${p.nombre}: ${p.categoria}`)
      continue
    }
    await prisma.product.upsert({
      where: { id: `seed-${p.id}` },
      update: {},
      create: {
        id: `seed-${p.id}`,
        name: p.nombre,
        price: p.precio,
        unit: 'ml',
        categoryId,
      },
    })
  }
  console.log(`Created ${productsData.length} products`)

  // Create default company settings
  await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'ALUMVI',
      tagline: 'Fabricación de Estructuras, Inoxidable y Cerramientos',
      phone: '',
      email: '',
      address: '',
      defaultMargin: 35,
      defaultValidity: 15,
      nextQuoteNumber: 1001,
    },
  })
  console.log('Created company settings')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
