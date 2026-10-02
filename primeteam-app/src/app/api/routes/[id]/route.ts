import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE una ruta
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }

    // Primero, busca si alguna itinerario está usando esta ruta
    const referringDocuments = await client.fetch(
      '*[references($id)]',
      { id }
    )

    if (referringDocuments.length > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar la ruta porque está siendo usada por ${referringDocuments.length} itinerario(s).` },
        { status: 409 } // 409 Conflict
      )
    }

    await client.delete(id)

    return NextResponse.json({ message: 'Ruta eliminada exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar la ruta:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

// UPDATE una ruta
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { pol, pod } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }
    if (!pol || !pod) {
      return NextResponse.json({ message: 'POL y POD son obligatorios.' }, { status: 400 })
    }
    if (pol === pod) {
      return NextResponse.json({ message: 'El puerto de origen y destino no pueden ser el mismo.' }, { status: 400 })
    }

    // Obtenemos los nombres de los puertos para generar el label
    const [originPort, destPort] = await Promise.all([
        client.fetch(`*[_id == $id][0].name`, { id: pol }),
        client.fetch(`*[_id == $id][0].name`, { id: pod })
    ]);

    if (!originPort || !destPort) {
        return NextResponse.json({ message: 'No se encontraron los puertos especificados.' }, { status: 404 });
    }

    const autoLabel = `${originPort.toUpperCase()} - ${destPort.toUpperCase()}`;

    await client
      .patch(id)
      .set({
        label: autoLabel,
        originPort: { _type: 'reference', _ref: pol },
        destinationPort: { _type: 'reference', _ref: pod },
        slug: { _type: 'slug', current: autoLabel.toLowerCase().replace(/\s+/g, '-') }
      })
      .commit()

    return NextResponse.json({ message: 'Ruta actualizada exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar la ruta:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}
