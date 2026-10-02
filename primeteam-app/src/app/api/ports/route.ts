import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'
import { portsQuery } from '@/lib/sanity.queries'

// GET all ports
export async function GET() {
  try {
    const ports = await client.fetch(portsQuery)
    return NextResponse.json(ports)
  } catch (error) {
    console.error('Error fetching ports:', error)
    return NextResponse.json({ message: 'Could not fetch ports' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newPortData = await request.json()

    // Validación simple
    if (!newPortData.name || !newPortData.code) {
      return NextResponse.json({ message: 'El nombre y el código del puerto son obligatorios.' }, { status: 400 })
    }
    
    // Aquí podrías añadir una validación para ver si el país existe, si es necesario
    
    await client.create({
      _type: 'port',
      name: newPortData.name,
      code: newPortData.code,
      type: newPortData.type || 'BOTH',
      country: newPortData.country ? { _type: 'reference', _ref: newPortData.country } : undefined,
      slug: {
        _type: 'slug',
        current: newPortData.name.toLowerCase().replace(/\s+/g, '-').slice(0, 95)
      }
    })

    return NextResponse.json({ message: 'Puerto creado exitosamente.' }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear el puerto:', error)
    return NextResponse.json({ message: 'Error al crear el puerto.', error: error.message }, { status: 500 })
  }
}
