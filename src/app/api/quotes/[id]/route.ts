import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Error al obtener presupuesto' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // If items are provided, delete old and create new
    if (items !== undefined) {
      await db.quoteItem.deleteMany({ where: { quoteId: id } })
    }

    const updateData: Record<string, unknown> = {}
    if (clientId !== undefined) updateData.clientId = clientId || null
    if (clientName !== undefined) updateData.clientName = clientName
    if (status !== undefined) updateData.status = status
    if (lacado !== undefined) updateData.lacado = parseFloat(String(lacado))
    if (margin !== undefined) updateData.margin = parseFloat(String(margin))
    if (validityDays !== undefined) updateData.validityDays = parseInt(String(validityDays))
    if (notes !== undefined) updateData.notes = notes || null

    if (items !== undefined) {
      updateData.items = {
        create: items.map((item: { productId: string; quantity: number; unitPrice: number; subtotal: number }) => ({
          productId: item.productId,
          quantity: parseFloat(String(item.quantity)),
          unitPrice: parseFloat(String(item.unitPrice)),
          subtotal: parseFloat(String(item.subtotal)),
        })),
      }
    }

    const quote = await db.quote.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Error al actualizar presupuesto' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.quoteItem.deleteMany({ where: { quoteId: id } })
    await db.quote.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: 'Error al eliminar presupuesto' }, { status: 500 })
  }
}
