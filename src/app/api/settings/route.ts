import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await db.companySettings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      const newSettings = await db.companySettings.create({
        data: {
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
      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      companyName,
      tagline,
      phone,
      email,
      address,
      defaultMargin,
      defaultValidity,
      nextQuoteNumber,
    } = body

    const settings = await db.companySettings.findFirst()

    if (!settings) {
      return NextResponse.json({ error: 'No se encontró la configuración' }, { status: 404 })
    }

    const updated = await db.companySettings.update({
      where: { id: settings.id },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(tagline !== undefined && { tagline }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(defaultMargin !== undefined && { defaultMargin: parseFloat(String(defaultMargin)) }),
        ...(defaultValidity !== undefined && { defaultValidity: parseInt(String(defaultValidity)) }),
        ...(nextQuoteNumber !== undefined && { nextQuoteNumber: parseInt(String(nextQuoteNumber)) }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
