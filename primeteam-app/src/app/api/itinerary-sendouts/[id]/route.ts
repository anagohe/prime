import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }

    await client.delete(id)

    return NextResponse.json({ message: 'Registro de envío eliminado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al eliminar registro de envío:', error)
    return NextResponse.json({ message: `Error de Sanity al eliminar: ${error.message}` }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      observations 
    } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }
    if (!route_id || !sent_date || !week_number || !status) {
      return NextResponse.json({ message: 'Ruta, Fecha, Semana y Estado son obligatorios.' }, { status: 400 })
    }

    await client
      .patch(id)
      .set({
        route: { _type: 'reference', _ref: route_id },
        responsible: responsible_id ? { _type: 'reference', _ref: responsible_id } : undefined,
        sent_date: sent_date,
        week_number: parseInt(week_number),
        status: status,
        delivery_method: delivery_method,
        business_name: business_name,
        email: email,
        shipping_line_name: shipping_line_name,
        team_name: team_name,
        location: location,
        reviewed: reviewed,
        preferred_carrier: preferred_carrier,
        sales_executive: sales_executive,
        free_days_origin: free_days_origin ? parseInt(free_days_origin) : undefined,
        periodicity: periodicity,
        observations: observations,
      })
      .commit()

    return NextResponse.json({ message: 'Registro de envío actualizado exitosamente.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar registro de envío:', error)
    return NextResponse.json({ message: `Error de Sanity al actualizar: ${error.message}` }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { reviewed } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'ID del documento no proporcionado.' }, { status: 400 })
    }

    await client
      .patch(id)
      .set({ reviewed })
      .commit()

    return NextResponse.json({ message: 'Estatus de revisión actualizado.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error al actualizar estatus de revisión:', error)
    return NextResponse.json({ message: `Error de Sanity: ${error.message}` }, { status: 500 })
  }
}
