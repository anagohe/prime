import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { pol, pod } = await request.json()

    if (!pol || !pod) {
      return NextResponse.json({ message: 'El puerto de origen (POL) y el puerto de destino (POD) son obligatorios.' }, { status: 400 })
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
    
    await client.create({
      _type: 'route',
      label: autoLabel,
      originPort: { _type: 'reference', _ref: pol },
      destinationPort: { _type: 'reference', _ref: pod },
      slug: { _type: 'slug', current: autoLabel.toLowerCase().replace(/\s+/g, '-') }
    })

    return NextResponse.json({ message: 'Ruta creada exitosamente.' }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear la ruta:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
