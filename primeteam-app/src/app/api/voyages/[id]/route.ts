import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE a voyage
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

    return NextResponse.json({ message: 'Viaje eliminado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar el viaje:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

// UPDATE a voyage
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { voyageCode, vesselId } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }
    if (!voyageCode) {
      return NextResponse.json({ message: 'El código de viaje es obligatorio.' }, { status: 400 })
    }

    const patch = client.patch(id).set({ voyageCode });
    
    if (vesselId) {
      patch.set({ vessel: { _type: 'reference', _ref: vesselId } });
    } else {
      patch.unset(['vessel']);
    }

    await patch.commit()

    return NextResponse.json({ message: 'Viaje actualizado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar el viaje:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}
