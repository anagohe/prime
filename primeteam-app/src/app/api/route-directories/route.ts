import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const newData = await request.json()

    if (!newData.route || !newData.responsible) {
      return NextResponse.json({ message: 'La ruta y el responsable son obligatorios.' }, { status: 400 })
    }
    
    // Evitar duplicados: no puede haber dos directorios para la misma ruta
    const existing = await client.fetch('*[_type == "routeDirectory" && route._ref == $routeId]', { routeId: newData.route })
    if (existing.length > 0) {
        return NextResponse.json({ message: 'Ya existe un directorio para esta ruta. Edítalo en su lugar.' }, { status: 409 })
    }

    await client.create({
      _type: 'routeDirectory',
      route: { _type: 'reference', _ref: newData.route },
      responsible: { _type: 'reference', _ref: newData.responsible },
      periodicity: newData.periodicity,
      update_day: newData.update_day,
      // 'guidelines' se manejaría mejor en el PUT/PATCH, se omite en la creación inicial inline
    })

    return NextResponse.json({ message: 'Directorio de ruta creado exitosamente.' }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear el directorio de ruta:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
