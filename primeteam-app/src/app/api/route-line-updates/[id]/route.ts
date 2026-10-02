import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE una actualización
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }

    await client.delete(id)

    return NextResponse.json({ message: 'Actualización eliminada exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar la actualización:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

// UPDATE una actualización
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updatedData = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }
    if (!updatedData.route || !updatedData.shippingLine || !updatedData.lastUpdateDate) {
      return NextResponse.json({ message: 'La ruta, la naviera y la fecha son obligatorias.' }, { status: 400 })
    }

    await client
      .patch(id)
      .set({
        route: { _type: 'reference', _ref: updatedData.route },
        shippingLine: { _type: 'reference', _ref: updatedData.shippingLine },
        lastUpdateDate: updatedData.lastUpdateDate,
        manual_status: updatedData.manual_status,
        status: updatedData.status,
        responsible: updatedData.responsible ? { _type: 'reference', _ref: updatedData.responsible } : undefined,
        update_day: updatedData.update_day,
      })
      .commit()

    return NextResponse.json({ message: 'Actualización actualizada exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar la actualización:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}
