import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE un buque
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

    return NextResponse.json({ message: 'Buque eliminado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar el buque:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

// UPDATE un buque
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, imo } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ message: 'El nombre es obligatorio.' }, { status: 400 })
    }

    await client
      .patch(id)
      .set({
        name,
        imo,
      })
      .commit()

    return NextResponse.json({ message: 'Buque actualizado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar el buque:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}
