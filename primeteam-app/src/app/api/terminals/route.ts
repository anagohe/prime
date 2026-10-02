import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, port } = await request.json()

    if (!name || !port) {
      return NextResponse.json({ message: 'El nombre y el puerto son obligatorios.' }, { status: 400 })
    }
    
    // Crear el documento en Sanity con la referencia correcta
    const result = await client.create({
      _type: 'terminal',
      name: name,
      port: { 
        _type: 'reference', 
        _ref: port 
      }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear la terminal:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}