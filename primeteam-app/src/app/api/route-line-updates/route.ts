import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const newData = await request.json()

    if (!newData.route || !newData.shippingLine || !newData.lastUpdateDate) {
      return NextResponse.json({ message: 'La ruta, la naviera y la fecha son obligatorias.' }, { status: 400 })
    }
    
    await client.create({
      _type: 'routeLineUpdate',
      route: { _type: 'reference', _ref: newData.route },
      shippingLine: { _type: 'reference', _ref: newData.shippingLine },
      lastUpdateDate: newData.lastUpdateDate,
      manual_status: newData.manual_status || 'PENDIENTE',
      status: newData.status || 'ACTIVA',
      responsible: newData.responsible ? { _type: 'reference', _ref: newData.responsible } : undefined,
      update_day: newData.update_day,
    })

    return NextResponse.json({ message: 'Actualización creada exitosamente.' }, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear la actualización:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
