import { PortsTable } from '@/components/PortsTable'
import { client } from '@/lib/sanity.client'
import { portsQuery, countriesQuery, regionsQuery } from '@/lib/sanity.queries'

// Hacemos la página un Server Component asíncrono
export default async function PortsPage() {
  // Obtenemos ambos listados de datos en paralelo para mayor eficiencia
  const [ports, countries, regions] = await Promise.all([
    client.fetch(portsQuery),
    client.fetch(countriesQuery),
    client.fetch(regionsQuery)
  ])

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Catálogo de Puertos</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gestiona los puertos de origen y destino.
          </p>
        </div>
      </div>
      
      <PortsTable data={ports} countries={countries} regions={regions} />
    </div>
  )
}
