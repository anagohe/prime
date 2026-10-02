import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity.client'
import { calculateClosingDocs, calculateCustomsClosing } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { items, fileName, uploadedBy, versionTag } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ message: 'No se proporcionaron datos válidos.' }, { status: 400 })
    }

    const transaction = client.transaction()
    let createdCount = 0

    for (const item of items) {
      // Lógica de procesamiento de cada item del Excel
      // ... (asumiendo que los datos vienen mapeados correctamente del ExcelUploader)
      
      const newItinerary = {
        _type: 'itinerary',
        // ... (mapeo de campos)
        range_status: 'on_time'
      }

      transaction.create(newItinerary)
      createdCount++
    }

    // Registrar en el historial de carga
    transaction.create({
      _type: 'uploadHistory',
      file_name: fileName,
      uploaded_at: new Date().toISOString(),
      version_tag: versionTag || 'v1'
    })

    await transaction.commit()

    return NextResponse.json({ message: `${createdCount} itinerarios importados exitosamente.` }, { status: 201 })
  } catch (error: any) {
    console.error('Error during Excel import:', error)
    return NextResponse.json({ message: error.message || 'Server error occurred.' }, { status: 500 })
  }
}
