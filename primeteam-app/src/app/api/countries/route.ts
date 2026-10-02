import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, iso3166, regionId } = await request.json()

    if (!name) {
      return NextResponse.json({ message: 'El nombre es obligatorio.' }, { status: 400 })
    }
    
    const createdCountry = await client.create({
      _type: 'country',
      name,
      iso3166,
      region: regionId ? { _type: 'reference', _ref: regionId } : undefined,
    })

    return NextResponse.json(createdCountry, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear el país:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
