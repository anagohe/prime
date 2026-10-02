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
} from '@/lib/sanity.queries'

import { ItineraryTable } from '@/components/ItineraryTable'
import { ClockIcon } from '@heroicons/react/24/outline'

export default async function DynamicTablePage() {
  const [
    itineraries,
    shippingLines,
    routes,
    vessels,
    terminals,
    services,
    voyages,
    ports,
  ] = await Promise.all([
    client.fetch(itinerariesQuery),
    client.fetch(shippingLinesQuery),
    client.fetch(routesQuery),
    client.fetch(vesselsQuery),
    client.fetch(terminalsQuery),
    client.fetch(servicesQuery),
    client.fetch(voyagesQuery),
    client.fetch(portsQuery),
  ])

  const tableColumnClass =
    'flex flex-col h-full shrink-0 shadow-lg rounded-xl border overflow-hidden transition-transform hover:scale-[1.01] duration-300'

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="shrink-0 border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-cyan-600">
          Tabla Dinámica (Vista Dinámica de Itinerarios)
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-black mt-1">
          Filtrado por Rango y Tránsitos Finales
        </p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 custom-horizontal-scroll">
        <div className="inline-flex flex-nowrap gap-6 h-full items-start pr-20 pb-4">
          <div className={`${tableColumnClass} w-[900px] border-cyan-200`}>
            <div className="p-3 bg-cyan-600 text-white font-bold text-xs uppercase flex items-center gap-2">
              <ClockIcon className="h-4 w-4" /> Itinerarios (Vista Dinámica)
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <ItineraryTable
                data={itineraries}
                shippingLines={shippingLines}
                routes={routes}
                vessels={vessels}
                terminals={terminals}
                services={services}
                voyages={voyages}
                ports={ports}
                routeLineConfigs={[]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}