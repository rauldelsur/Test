import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    const quotes = await db.quote.findMany({
      where,
      include: {
        client: true,
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Error al obtener presupuestos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      clientId,
      clientName,
      status,
      lacado,
      margin,
      validityDays,
      notes,
      items,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El presupuesto debe tener al menos un item' }, { status: 400 })
    }

    // Get and increment the next quote number atomically
    const settings = await db.companySettings.findFirst()
    if (!settings) {
      return NextResponse.json({ error: 'No se encontró la configuración de la empresa' }, { status: 500 })
    }

    const quoteNumber = settings.nextQuoteNumber
    await db.companySettings.update({
      where: { id: settings.id },
      data: { nextQuoteNumber: quoteNumber + 1 },
    })

    const quote = await db.quote.create({
      data: {
        number: quoteNumber,
        clientId: clientId || null,
        clientName: clientName || 'Cliente General',
        status: status || 'borrador',
        lacado: lacado !== undefined ? parseFloat(String(lacado)) : 0,
        margin: margin !== undefined ? parseFloat(String(margin)) : settings.defaultMargin,
        validityDays: validityDays !== undefined ? parseInt(String(validityDays)) : settings.defaultValidity,
        notes: notes || null,
        items: {
          create: items.map((item: { productId: string; quantity: number; unitPrice: number; subtotal: number }) => ({
            productId: item.productId,
            quantity: parseFloat(String(item.quantity)),
            unitPrice: parseFloat(String(item.unitPrice)),
            subtotal: parseFloat(String(item.subtotal)),
          })),
        },
      },
      include: {
        client: true,
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Error al crear presupuesto' }, { status: 500 })
  }
}
