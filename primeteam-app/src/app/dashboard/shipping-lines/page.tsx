import { ShippingLinesTable } from '@/components/ShippingLinesTable'
import { client } from '@/lib/sanity.client'
import { shippingLinesQuery } from '@/lib/sanity.queries'

// Hacemos la página un Server Component asíncrono
export default async function ShippingLinesPage() {
  // Obtenemos los datos directamente en el servidor
  const shippingLines = await client.fetch(shippingLinesQuery)

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Catálogo de Navieras</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gestiona las líneas navieras.
          </p>
        </div>
        {/* Aquí podrías añadir un botón de "Nueva Naviera" */}
      </div>
      
      <ShippingLinesTable data={shippingLines} />
    </div>
  )
}
