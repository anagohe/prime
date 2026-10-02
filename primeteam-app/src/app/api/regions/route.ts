import { client } from '@/lib/sanity.client'
import { regionsQuery } from '@/lib/sanity.queries'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const regions = await client.fetch(regionsQuery)
    return NextResponse.json(regions)
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json({ message: 'Could not fetch regions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ message: 'Name is required.' }, { status: 400 })
    }

    const newRegion = {
      _type: 'region',
      name,
    }

    const createdRegion = await client.create(newRegion)
    return NextResponse.json(createdRegion, { status: 201 })
  } catch (error: any) {
    console.error('Error creating region:', error)
    return NextResponse.json({ message: `Error creating region: ${error.message}` }, { status: 500 })
  }
}
