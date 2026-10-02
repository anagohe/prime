import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'
import { vesselsQuery } from '@/lib/sanity.queries'

// GET all vessels
export async function GET() {
  try {
    const vessels = await client.fetch(vesselsQuery)
    return NextResponse.json(vessels)
  } catch (error) {
    console.error('Error fetching vessels:', error)
    return NextResponse.json({ message: 'Could not fetch vessels' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, imo } = await request.json()

    if (!name) {
      return NextResponse.json({ message: 'El nombre es obligatorio.' }, { status: 400 })
    }
    
    await client.create({
      _type: 'vessel',
      name,
      imo,
    })

    return NextResponse.json({ message: 'Buque creado exitosamente.' }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear el buque:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
