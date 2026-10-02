import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { fullName, email, role } = await request.json()

    if (!fullName) {
      return NextResponse.json({ message: 'El nombre completo es obligatorio.' }, { status: 400 })
    }
    
    await client.create({
      _type: 'person',
      fullName,
      email,
      role,
      slug: {
        _type: 'slug',
        current: fullName.toLowerCase().replace(/\s+/g, '-').slice(0, 95)
      }
    })

    return NextResponse.json({ message: 'Persona creada exitosamente.' }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear la persona:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
