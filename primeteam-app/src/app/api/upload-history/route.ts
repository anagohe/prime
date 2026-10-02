import { client } from '@/lib/sanity.client'
import { uploadHistoryQuery } from '@/lib/sanity.queries'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const history = await client.fetch(uploadHistoryQuery)
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching upload history:', error)
    return NextResponse.json({ message: 'Could not fetch upload history' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { file_name, uploaded_by, version_tag } = await request.json()

    if (!file_name) {
      return NextResponse.json({ message: 'File name is required.' }, { status: 400 })
    }

    const newUpload = {
      _type: 'uploadHistory',
      file_name,
      uploaded_at: new Date().toISOString(),
      uploaded_by: uploaded_by ? { _type: 'reference', _ref: uploaded_by } : undefined,
      version_tag,
    }

    const createdUpload = await client.create(newUpload)
    return NextResponse.json(createdUpload, { status: 201 })
  } catch (error: any) {
    console.error('Error creating upload history entry:', error)
    return NextResponse.json({ message: `Error creating upload history: ${error.message}` }, { status: 500 })
  }
}
