import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE una naviera
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

    return NextResponse.json({ message: 'Naviera eliminada exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar la naviera:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

// UPDATE una naviera
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
    if (!updatedData.name || !updatedData.code) {
      return NextResponse.json({ message: 'El nombre y el código son obligatorios.' }, { status: 400 })
    }

    await client
      .patch(id)
      .set({
        name: updatedData.name,
        code: updatedData.code,
      })
      .commit()

    return NextResponse.json({ message: 'Naviera actualizada exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar la naviera:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}
