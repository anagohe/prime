import { client } from '@/lib/sanity.client'
import { voyagesQuery } from '@/lib/sanity.queries'
import { NextResponse } from 'next/server'

// GET all voyages
export async function GET() {
  try {
    const voyages = await client.fetch(voyagesQuery)
    return NextResponse.json(voyages)
  } catch (error) {
    console.error('Error fetching voyages:', error)
    return NextResponse.json({ message: 'Could not fetch voyages' }, { status: 500 })
  }
}

// POST a new voyage
export async function POST(request: Request) {
  try {
    const { voyageCode, vesselId, rawVesselVoyage } = await request.json()

    if (!voyageCode) {
      return NextResponse.json({ message: 'voyageCode is required.' }, { status: 400 })
    }

    const newVoyage = {
      _type: 'voyage',
      voyageCode,
      vessel: vesselId ? { _type: 'reference', _ref: vesselId } : undefined,
      rawVesselVoyage,
    }

    const createdVoyage = await client.create(newVoyage)

    return NextResponse.json(createdVoyage, { status: 201 })
  } catch (error: any) {
    console.error('Error creating voyage:', error)
    return NextResponse.json({ message: `Error creating voyage: ${error.message}` }, { status: 500 })
  }
}
