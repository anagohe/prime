import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'
import { shippingLinesQuery } from '@/lib/sanity.queries'

// GET all shipping lines
export async function GET() {
  try {
    const shippingLines = await client.fetch(shippingLinesQuery)
    return NextResponse.json(shippingLines)
  } catch (error) {
    console.error('Error fetching shipping lines:', error)
    return NextResponse.json({ message: 'Could not fetch shipping lines' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json()

    if (!newData.name || !newData.code) {
      return NextResponse.json({ message: 'El nombre y el código son obligatorios.' }, { status: 400 })
    }
    
    await client.create({
      _type: 'shippingLine',
      name: newData.name,
      code: newData.code,
    })

    return NextResponse.json({ message: 'Naviera creada exitosamente.' }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear la naviera:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
