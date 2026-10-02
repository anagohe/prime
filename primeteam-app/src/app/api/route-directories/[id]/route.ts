import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE un directorio de ruta
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

    return NextResponse.json({ message: 'Directorio de ruta eliminado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar el directorio:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

// UPDATE un directorio de ruta
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
    if (!updatedData.route || !updatedData.responsible) {
      return NextResponse.json({ message: 'La ruta y el responsable son obligatorios.' }, { status: 400 })
    }
    
    // Opcional: verificar que no se está duplicando la ruta
    const existing = await client.fetch('*[_type == "routeDirectory" && route._ref == $routeId && _id != $id]', { routeId: updatedData.route, id })
    if (existing.length > 0) {
        return NextResponse.json({ message: 'Ya existe otro directorio para la ruta seleccionada.' }, { status: 409 })
    }


    await client
      .patch(id)
      .set({
        route: { _type: 'reference', _ref: updatedData.route },
        responsible: { _type: 'reference', _ref: updatedData.responsible },
        periodicity: updatedData.periodicity,
        update_day: updatedData.update_day,
        // guidelines se omiten de la edición inline por simplicidad
      })
      .commit()

    return NextResponse.json({ message: 'Directorio de ruta actualizado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar el directorio:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}
