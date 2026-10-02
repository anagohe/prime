import { client } from '@/lib/sanity.client'
import { 
  itinerariesQuery, 
  shippingLinesQuery, 
  routesQuery, 
  vesselsQuery, 
  terminalsQuery, 
  servicesQuery, 
  voyagesQuery, 
  portsQuery,
  routeLineConfigsQuery
} from '@/lib/sanity.queries'
import { ItineraryTable } from '@/components/ItineraryTable'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OperationsPage() {
  // Cargamos todos los datos necesarios para la tabla y su modal de creación
  const [
    itineraries,
    shippingLines,
    routes,
    vessels,
    terminals,
    services,
    voyages,
    ports,
    routeLineConfigs
  ] = await Promise.all([
    client.fetch(itinerariesQuery),
    client.fetch(shippingLinesQuery),
    client.fetch(routesQuery),
    client.fetch(vesselsQuery),
    client.fetch(terminalsQuery),
    client.fetch(servicesQuery),
    client.fetch(voyagesQuery),
    client.fetch(portsQuery),
    client.fetch(routeLineConfigsQuery),
  ])

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Panel de Operaciones
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Gestiona y supervisa todos los itinerarios activos y sus estados operativos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-[#1e4079] mb-4">Control de Itinerarios</h3>
            <ItineraryTable 
              data={itineraries} 
              shippingLines={shippingLines}
              routes={routes}
              vessels={vessels}
              terminals={terminals}
              services={services}
              voyages={voyages}
              ports={ports}
              routeLineConfigs={routeLineConfigs}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
