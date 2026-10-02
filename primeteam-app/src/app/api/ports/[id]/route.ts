import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

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

    return NextResponse.json({ message: 'Puerto eliminado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar el puerto:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

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

    // Prepara los datos para la actualización
    const patchData: { [key: string]: any } = {
      name: updatedData.name,
      code: updatedData.code,
    };
    if (updatedData.country) {
      patchData.country = { _type: 'reference', _ref: updatedData.country };
    }

    await client
      .patch(id)
      .set(patchData)
      .commit()

    return NextResponse.json({ message: 'Puerto actualizado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar el puerto:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}
