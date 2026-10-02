import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE una persona
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }

    const referringDocs = await client.fetch('*[references($id)]', { id });
    if (referringDocs.length > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar porque esta persona es responsable en ${referringDocs.length} directorio(s) de ruta.` },
        { status: 409 }
      );
    }

    await client.delete(id)

    return NextResponse.json({ message: 'Persona eliminada exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar la persona:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

// UPDATE una persona
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { fullName, email, role } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }
    if (!fullName) {
      return NextResponse.json({ message: 'El nombre completo es obligatorio.' }, { status: 400 })
    }

    await client
      .patch(id)
      .set({
        fullName,
        email,
        role,
        'slug.current': fullName.toLowerCase().replace(/\s+/g, '-').slice(0, 95)
      })
      .commit()

    return NextResponse.json({ message: 'Persona actualizada exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar la persona:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}
