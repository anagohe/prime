import { client } from '@/lib/sanity.client'
import { 
  routesQuery, 
  portsQuery,
  uploadHistoryQuery,
  vesselsQuery,
  voyagesQuery,
  peopleQuery,
  routeLineUpdatesQuery,
  shippingLinesQuery
} from '@/lib/sanity.queries'

import { RoutesTable } from '@/components/RoutesTable'
import { UploadHistoryTable } from '@/components/UploadHistoryTable'
import { VesselsTable } from '@/components/VesselsTable'
import { VoyagesTable } from '@/components/VoyagesTable'
import { UnifiedRouteUpdatesTable } from '@/components/UnifiedRouteUpdatesTable'

import { 
  MapIcon, 
  CloudArrowUpIcon,
  ArchiveBoxIcon,
  TicketIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ItineraryDirectoriesPage() {
  const [
    routes, 
    ports, 
    uploadHistory,
    vessels,
    voyages,
    people,
    routeLineUpdates,
    shippingLines
  ] = await Promise.all([
    client.fetch(routesQuery),
    client.fetch(portsQuery),
    client.fetch(uploadHistoryQuery),
    client.fetch(vesselsQuery),
    client.fetch(voyagesQuery),
    client.fetch(peopleQuery),
    client.fetch(routeLineUpdatesQuery),
    client.fetch(shippingLinesQuery),
  ])

  const routeRefs = routes.map((r: any) => ({ _id: r._id, label: r.label }))
  const shippingLineRefs = shippingLines.map((s: any) => ({ _id: s._id, name: s.name }))

  const tableColumnClass = "flex flex-col h-full shrink-0 shadow-lg rounded-xl border overflow-visible transition-transform hover:scale-[1.01] duration-300 min-w-[600px]";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="shrink-0 border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-700">Directorios y Gestión Operativa</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-black mt-1">
          Rutas, Responsables y Control de Seguimiento
        </p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 custom-horizontal-scroll [transform:rotateX(180deg)]">
        <div className="inline-flex flex-nowrap gap-8 h-full items-start pr-20 pb-4 [transform:rotateX(180deg)]">
          
          {/* --- TABLA UNIFICADA DE ACTUALIZACIONES --- */}
          <div className={`${tableColumnClass} border-slate-200 min-w-[1200px]`}>
            <div className="p-3 bg-slate-700 text-white font-bold text-xs uppercase flex items-center gap-2">
              <TableCellsIcon className="h-4 w-4" /> MATRIZ DE CONTROL Y SEGUIMIENTO
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
                <UnifiedRouteUpdatesTable 
                    data={routeLineUpdates} 
                    routes={routeRefs} 
                    shippingLines={shippingLineRefs} 
                    people={people} 
                />
            </div>
          </div>

          {/* --- BLOQUES OCULTOS TEMPORALMENTE --- */}
          {/* 
          <div className={`${tableColumnClass} border-blue-200 min-w-[700px]`}>
            <div className="p-3 bg-blue-600 text-white font-bold text-xs uppercase flex items-center gap-2">
              <MapIcon className="h-4 w-4" /> RUTAS MAESTRAS
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white"><RoutesTable data={routes} ports={ports} /></div>
          </div>

          <div className={`${tableColumnClass} border-indigo-200`}>
            <div className="p-3 bg-indigo-600 text-white font-bold text-xs uppercase flex items-center gap-2">
              <ArchiveBoxIcon className="h-4 w-4" /> BUQUES
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white"><VesselsTable data={vessels} /></div>
          </div>

          <div className={`${tableColumnClass} border-indigo-200`}>
            <div className="p-3 bg-indigo-600 text-white font-bold text-xs uppercase flex items-center gap-2">
              <TicketIcon className="h-4 w-4" /> VIAJES
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white"><VoyagesTable data={voyages} vessels={vessels} /></div>
          </div>

          <div className={`${tableColumnClass} border-slate-200 min-w-[700px]`}>
            <div className="p-3 bg-slate-800 text-white font-bold text-xs uppercase flex items-center gap-2">
              <CloudArrowUpIcon className="h-4 w-4" /> HISTORIAL DE CARGAS
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white"><UploadHistoryTable data={uploadHistory} /></div>
          </div>
          */}

        </div>
      </div>
    </div>
  )
}
