import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

const normalizeCargoAcceptance = (value?: string) => {
  if (value === 'SI') return 'ACEPTA'
  if (value === 'NO') return 'NO ACEPTA'
  return value
}

export async function POST(request: Request) {
  try {
    const {
      shipping_line_id,
      route_id,
      etd,
      eta,
      service_id,
      voyage_id,
      terminal_id,
      final_etd,
      final_eta,
      final_transit_time_days,
      final_doc_closing,
      final_customs_closing,
      cargo_acceptance,
      fcl_lcl,
      ts_port_id,
      remarks,
    } = await request.json()

    if (!shipping_line_id || !route_id || !etd || !eta) {
      return NextResponse.json(
        { message: 'Shipping Line, Route, ETD, and ETA are required.' },
        { status: 400 }
      )
    }

    const newItinerary: any = {
      _type: 'itinerary',
      shipping_line: { _type: 'reference', _ref: shipping_line_id },
      route: { _type: 'reference', _ref: route_id },
      service: service_id ? { _type: 'reference', _ref: service_id } : undefined,
      voyage: voyage_id ? { _type: 'reference', _ref: voyage_id } : undefined,
      terminal: terminal_id ? { _type: 'reference', _ref: terminal_id } : undefined,
      etd: etd ? etd.split('T')[0] : undefined,
      eta: eta ? eta.split('T')[0] : undefined,
      final_etd: final_etd || undefined,
      final_eta: final_eta || undefined,
      final_transit_time_days: final_transit_time_days
        ? parseInt(final_transit_time_days)
        : undefined,
      final_doc_closing: final_doc_closing || undefined,
      final_customs_closing: final_customs_closing || undefined,
      cargo_acceptance: normalizeCargoAcceptance(cargo_acceptance) || undefined,
      fcl_lcl: fcl_lcl || undefined,
      ts_port: ts_port_id ? { _type: 'reference', _ref: ts_port_id } : undefined,
      remarks: remarks || undefined,
    }

    if (eta && etd) {
      const transitTime =
        (new Date(eta).getTime() - new Date(etd).getTime()) / (1000 * 3600 * 24)

      if (transitTime > 0) {
        newItinerary.transit_time = Math.round(transitTime)
      }
    }

    if (final_eta && final_etd && !final_transit_time_days) {
      const finalTransitTime =
        (new Date(final_eta).getTime() - new Date(final_etd).getTime()) /
        (1000 * 3600 * 24)

      if (finalTransitTime > 0) {
        newItinerary.final_transit_time_days = Math.round(finalTransitTime)
      }
    }

    await client.create(newItinerary)

    return NextResponse.json(
      { message: 'Itinerary created successfully.' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating itinerary:', error)
    return NextResponse.json(
      { message: `Sanity Error: ${error.message}` },
      { status: 500 }
    )
  }
}