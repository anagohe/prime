import { client } from '@/lib/sanity.client'
import { uploadHistoryQuery } from '@/lib/sanity.queries'
import { UploadHistoryTable } from '@/components/UploadHistoryTable'

export default async function UploadHistoryPage() {
  const history = await client.fetch(uploadHistoryQuery)

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Historial de Cargas</h1>
        <p className="mt-2 text-sm text-gray-500">
          Consulta el registro de archivos Excel cargados al sistema.
        </p>
      </div>
      
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <UploadHistoryTable data={history} />
      </div>
    </div>
  )
}
