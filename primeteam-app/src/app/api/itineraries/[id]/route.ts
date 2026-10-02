import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

const normalizeCargoAcceptance = (value?: string) => {
  if (value === 'SI') return 'ACEPTA'
  if (value === 'NO') return 'NO ACEPTA'
  return value
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await client.delete(id)
    return NextResponse.json({ message: 'Itinerary deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting itinerary:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const setData: Record<string, any> = {}
    const unsetFields: string[] = []

    const setOrUnsetReference = (
      bodyKey: string,
      sanityField: string,
      { required = false }: { required?: boolean } = {}
    ) => {
      if (body[bodyKey] === undefined) return

      if (body[bodyKey]) {
        setData[sanityField] = {
          _type: 'reference',
          _ref: body[bodyKey],
        }
      } else if (!required) {
        unsetFields.push(sanityField)
      }
    }

    // Referencias
    setOrUnsetReference('shipping_line_id', 'shipping_line', { required: true })
    setOrUnsetReference('route_id', 'route', { required: true })
    setOrUnsetReference('service_id', 'service')
    setOrUnsetReference('voyage_id', 'voyage')
    setOrUnsetReference('terminal_id', 'terminal')
    setOrUnsetReference('ts_port_id', 'ts_port')

    // Campos escalares
    if (body.etd !== undefined && body.etd) setData.etd = body.etd
    if (body.eta !== undefined && body.eta) setData.eta = body.eta
    if (body.final_etd !== undefined) setData.final_etd = body.final_etd || null
    if (body.final_eta !== undefined) setData.final_eta = body.final_eta || null
    if (body.final_doc_closing !== undefined) {
      setData.final_doc_closing = body.final_doc_closing || null
    }
    if (body.final_customs_closing !== undefined) {
      setData.final_customs_closing = body.final_customs_closing || null
    }
    if (body.cargo_acceptance !== undefined) {
      setData.cargo_acceptance = normalizeCargoAcceptance(body.cargo_acceptance) || null
    }
    if (body.fcl_lcl !== undefined) setData.fcl_lcl = body.fcl_lcl || null
    if (body.remarks !== undefined) setData.remarks = body.remarks || null

    // Recalcular transit times
    const effectiveFinalEtd = body.final_etd !== undefined ? body.final_etd : undefined
    const effectiveFinalEta = body.final_eta !== undefined ? body.final_eta : undefined

    if (effectiveFinalEtd && effectiveFinalEta) {
      const finalTransitTime =
        (new Date(effectiveFinalEta).getTime() - new Date(effectiveFinalEtd).getTime()) /
        (1000 * 3600 * 24)

      if (finalTransitTime > 0) {
        setData.final_transit_time_days = Math.round(finalTransitTime)
      }
    }

    const effectiveEtd = body.etd !== undefined ? body.etd : undefined
    const effectiveEta = body.eta !== undefined ? body.eta : undefined

    if (effectiveEtd && effectiveEta) {
      const transitTime =
        (new Date(effectiveEta).getTime() - new Date(effectiveEtd).getTime()) /
        (1000 * 3600 * 24)

      if (transitTime > 0) {
        setData.transit_time = Math.round(transitTime)
      }
    }

    if (Object.keys(setData).length === 0 && unsetFields.length === 0) {
      return NextResponse.json({ message: 'No changes to apply' })
    }

    let patch = client.patch(id)

    if (Object.keys(setData).length > 0) {
      patch = patch.set(setData)
    }

    if (unsetFields.length > 0) {
      patch = patch.unset(unsetFields)
    }

    await patch.commit()

    return NextResponse.json({ message: 'Itinerary updated successfully' })
  } catch (error: any) {
    console.error('Error updating itinerary:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}