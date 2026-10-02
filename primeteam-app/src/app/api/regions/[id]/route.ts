import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await client.delete(id)
    return NextResponse.json({ message: 'Region deleted successfully.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting region:', error)
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ message: 'Name is required.' }, { status: 400 })
    }

    await client.patch(id).set({ name }).commit()
    return NextResponse.json({ message: 'Region updated successfully.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating region:', error)
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 })
  }
}
