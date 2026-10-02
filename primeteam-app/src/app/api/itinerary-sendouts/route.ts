import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { 
      route_id, 
      responsible_id, 
      sent_date, 
      week_number, 
      status, 
      delivery_method,
      business_name,
      email,
      shipping_line_name,
      team_name,
      location,
      reviewed,
      preferred_carrier,
      sales_executive,
      free_days_origin,
      periodicity,
      observations,
      is_updated_manual 
    } = await request.json()

    if (!route_id || !sent_date || !week_number || !status) {
      return NextResponse.json({ message: 'Ruta, Fecha, Semana y Estado son obligatorios.' }, { status: 400 })
    }

    const newSendout = {
      _type: 'itinerarySendout',
      route: { _type: 'reference', _ref: route_id },
      responsible: responsible_id ? { _type: 'reference', _ref: responsible_id } : undefined,
      sent_date: sent_date,
      week_number: parseInt(week_number),
      status: status,
      is_updated_manual: is_updated_manual !== undefined ? is_updated_manual : true,
      delivery_method: delivery_method,
      business_name: business_name,
      email: email,
      shipping_line_name: shipping_line_name,
      team_name: team_name,
      location: location,
      reviewed: reviewed || false,
      preferred_carrier: preferred_carrier,
      sales_executive: sales_executive,
      free_days_origin: free_days_origin ? parseInt(free_days_origin) : undefined,
      periodicity: periodicity,
      observations: observations,
    }

    await client.create(newSendout)

    return NextResponse.json({ message: 'Registro de envío creado exitosamente.' }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating itinerary sendout:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
