import { client } from '@/lib/sanity.client'
import { servicesQuery } from '@/lib/sanity.queries'
import { NextResponse } from 'next/server'

// GET: Obtener todos los servicios
export async function GET() {
  try {
    const services = await client.fetch(servicesQuery)
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ message: 'Could not fetch services' }, { status: 500 })
  }
}

// POST: Crear un nuevo servicio
export async function POST(request: Request) {
  try {
    const { name, code } = await request.json()

    if (!name || !code) {
      return NextResponse.json({ message: 'Name and code are required.' }, { status: 400 })
    }

    // Crear el slug automáticamente
    const slug = {
      _type: 'slug',
      current: name.toLowerCase().replace(/\s+/g, '-').slice(0, 96),
    };

    const newService = {
      _type: 'service',
      name,
      code,
      slug,
    }

    // IMPORTANTE: El cliente de Sanity debe tener un Token con permisos de escritura
    const createdService = await client.create(newService)

    return NextResponse.json(createdService, { status: 201 })
  } catch (error: any) {
    console.error('Error creating service:', error)
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 })
  }
}