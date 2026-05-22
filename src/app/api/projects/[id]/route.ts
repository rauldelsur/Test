import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: {
        client: true,
        quotes: {
          include: {
            items: true,
            client: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Error al obtener la obra' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, clientId } = body

    const project = await db.project.update({
      where: { id },
      data: {
        name,
        description: description !== undefined ? description : undefined,
        clientId: clientId !== undefined ? clientId : undefined,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Error al actualizar la obra' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Error al eliminar la obra' }, { status: 500 })
  }
}
