import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

// DELETE: Eliminar un servicio
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Definimos params como Promesa
) {
  try {
    // IMPORTANTE: Primero esperamos a que los params se resuelvan
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    await client.delete(id);

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { message: `Error deleting service: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un servicio
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Definimos params como Promesa
) {
  try {
    // IMPORTANTE: Primero esperamos a que los params se resuelvan
    const { id } = await params;
    const { name, code } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    const slug = {
      _type: 'slug',
      current: name.toLowerCase().replace(/\s+/g, '-').slice(0, 96),
    };

    const updatedService = await client
      .patch(id)
      .set({ name, code, slug })
      .commit();

    return NextResponse.json(updatedService);
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { message: `Error updating service: ${error.message}` },
      { status: 500 }
    );
  }
}