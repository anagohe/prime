import { VesselsTable } from '@/components/VesselsTable'
import { client } from '@/lib/sanity.client'
import { vesselsQuery } from '@/lib/sanity.queries'

// Hacemos la página un Server Component asíncrono
export default async function VesselsPage() {
  // Obtenemos los datos directamente en el servidor
  const vessels = await client.fetch(vesselsQuery)

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Catálogo de Buques</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gestiona los buques.
          </p>
        </div>
        {/* Aquí podrías añadir un botón de "Nuevo Buque" */}
      </div>
      
      <VesselsTable data={vessels} />
    </div>
  )
}
