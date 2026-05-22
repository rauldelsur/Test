import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (categoryId) where.categoryId = categoryId

    let products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
    })

    if (search) {
      const lowerSearch = search.toLowerCase()
      products = products.filter(p => p.name.toLowerCase().includes(lowerSearch))
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, unit, categoryId } = body

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name,
        price: parseFloat(String(price)),
        unit: unit || 'ml',
        categoryId,
      },
      include: { category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
