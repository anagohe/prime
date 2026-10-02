import { client } from '@/lib/sanity.client'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await client.delete(id)
    return NextResponse.json({ message: 'Upload history entry deleted successfully.' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting upload history entry:', error)
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 })
  }
}
