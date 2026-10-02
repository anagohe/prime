import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE una terminal
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ message: 'ID no proporcionado.' }, { status: 400 })
    }

    await client.delete(id)

    return NextResponse.json({ message: 'Terminal eliminada exitosamente.' })
  } catch (error: any) {
    console.error('Error al eliminar la terminal:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// UPDATE (PUT) una terminal
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, port } = await request.json() // Recibimos 'port'

    if (!id || !name || !port) {
      return NextResponse.json({ message: 'Faltan datos obligatorios (nombre/puerto).' }, { status: 400 })
    }

    // Actualizamos usando patch y commit
    const result = await client
      .patch(id)
      .set({
        name: name,
        port: { 
          _type: 'reference', 
          _ref: port 
        }
      })
      .commit()

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar la terminal:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}