import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const totalProjects = await db.project.count()
    const totalQuotes = await db.quote.count()
    const totalProducts = await db.product.count()
    const totalClients = await db.client.count()
    
    const recentQuotes = await db.quote.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        items: true,
      },
    })
    
    const quotesByStatus = await db.quote.groupBy({
      by: ['status'],
      _count: { status: true },
    })
    
    const settings = await db.companySettings.findFirst()

    // Calculate totals for recent quotes
    const recentQuotesWithTotals = recentQuotes.map((quote) => {
      const subtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0)
      const marginAmount = subtotal * (quote.margin / 100)
      const total = subtotal + marginAmount + quote.lacado
      return {
        ...quote,
        calculatedSubtotal: subtotal,
        calculatedMargin: marginAmount,
        calculatedTotal: total,
      }
    })

    const statusCounts: Record<string, number> = {}
    quotesByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status
    })

    return NextResponse.json({
      totalProjects,
      totalQuotes,
      totalProducts,
      totalClients,
      recentQuotes: recentQuotesWithTotals,
      quotesByStatus: statusCounts,
      settings,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Error al obtener datos del dashboard' }, { status: 500 })
  }
}
