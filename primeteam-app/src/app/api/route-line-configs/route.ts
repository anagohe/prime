import { client } from '@/lib/sanity.client'
import { routeLineConfigsQuery } from '@/lib/sanity.queries'
import { NextResponse } from 'next/server'

// GET all route-line-configs
export async function GET() {
  try {
    const configs = await client.fetch(routeLineConfigsQuery)
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error fetching route line configs:', error)
    return NextResponse.json({ message: 'Could not fetch route line configs' }, { status: 500 })
  }
}

// POST a new route-line-config
export async function POST(request: Request) {
  try {
    const { routeId, shippingLineId, serviceId, terminalId, cargo_acceptance } = await request.json()

    if (!routeId || !shippingLineId) {
      return NextResponse.json({ message: 'Route and Shipping Line are required.' }, { status: 400 })
    }

    const newConfig = {
      _type: 'routeLineConfig',
      route: { _type: 'reference', _ref: routeId },
      shippingLine: { _type: 'reference', _ref: shippingLineId },
      service: serviceId ? { _type: 'reference', _ref: serviceId } : undefined,
      terminal: terminalId ? { _type: 'reference', _ref: terminalId } : undefined,
      cargo_acceptance: cargo_acceptance,
    }

    const createdConfig = await client.create(newConfig)

    return NextResponse.json(createdConfig, { status: 201 })
  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error('Error creating route line config:', error)
    return NextResponse.json({ message: `Error creating route line config: ${error.message}` }, { status: 500 })
  }
}
