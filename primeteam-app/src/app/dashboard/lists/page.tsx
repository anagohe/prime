import { client } from '@/lib/sanity.client'
import { 
  portsQuery, 
  countriesQuery, 
  regionsQuery,
  shippingLinesQuery,
  terminalsQuery,
  servicesQuery,
  routesQuery,
  peopleQuery,
  vesselsQuery,
  voyagesQuery,
} from '@/lib/sanity.queries'

import { PortsTable } from '@/components/PortsTable'
import { ShippingLinesTable } from '@/components/ShippingLinesTable'
import { TerminalsTable } from '@/components/TerminalsTable'
import { ServicesTable } from '@/components/ServicesTable'
import { PeopleTable } from '@/components/PeopleTable'
import { RoutesTable } from '@/components/RoutesTable'
import { VesselsTable } from '@/components/VesselsTable'
import { VoyagesTable } from '@/components/VoyagesTable'

import { 
  BuildingOfficeIcon, 
  TruckIcon, 
  UserGroupIcon,
  MapIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ListsPage() {
  const [
    ports, 
    countries, 
    regions,
    shippingLines, 
    terminals, 
    services,
    routes,
    people,
    vessels,
    voyages
  ] = await Promise.all([
    client.fetch(portsQuery),
    client.fetch(countriesQuery),
    client.fetch(regionsQuery),
    client.fetch(shippingLinesQuery),
    client.fetch(terminalsQuery),
    client.fetch(servicesQuery),
    client.fetch(routesQuery),
    client.fetch(peopleQuery),
    client.fetch(vesselsQuery),
    client.fetch(voyagesQuery),
  ])

  const tableColumnClass = "flex flex-col h-full shrink-0 shadow-lg rounded-xl border overflow-visible transition-transform hover:scale-[1.01] duration-300 min-w-[500px]";

  // Filtrar puertos por tipo o por convención (México = POL, Otros = POD)
  const pols = ports.filter((p: any) => p.type === 'POL' || p.type === 'BOTH' || p.country === 'Mexico' || p.country === 'México');
  const pods = ports.filter((p: any) => p.type === 'POD' || p.type === 'BOTH' || (p.country !== 'Mexico' && p.country !== 'México'));

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="shrink-0 border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#1e4079]">Listas (Configuración Maestra)</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-black mt-1">
          Catálogos de Origen, Destino y Reglas Operativas
        </p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 custom-horizontal-scroll [transform:rotateX(180deg)]">
        <div className="inline-flex flex-nowrap gap-8 h-full items-start pr-20 pb-4 [transform:rotateX(180deg)]">
          
          {/* --- BLOQUE 1: ORIGEN - POL (Azul Rey) --- */}
          <div className="flex flex-nowrap gap-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 min-w-max">
            <div className={`${tableColumnClass} border-blue-200 min-w-[800px]`}>
              <div className="p-3 bg-blue-600 text-white font-bold text-xs uppercase flex items-center gap-2">
                <BuildingOfficeIcon className="h-4 w-4" /> POL
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-white"><PortsTable data={pols} countries={countries} regions={regions} title="POL" /></div>
            </div>
          </div>

          {/* --- BLOQUE 2: DESTINO - POD (Naranja) --- */}
          <div className="flex flex-nowrap gap-6 p-6 bg-orange-50/50 rounded-2xl border border-orange-100 min-w-max">
            <div className={`${tableColumnClass} border-orange-200 min-w-[800px]`}>
              <div className="p-3 bg-orange-500 text-white font-bold text-xs uppercase flex items-center gap-2">
                <BuildingOfficeIcon className="h-4 w-4" /> POD
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-white"><PortsTable data={pods} countries={countries} regions={regions} title="POD" /></div>
            </div>
          </div>

          {/* --- BLOQUE 3: RUTAS MAESTRAS (Indigo) --- */}
          <div className={`${tableColumnClass} border-indigo-200 min-w-[700px]`}>
            <div className="p-3 bg-indigo-600 text-white font-bold text-xs uppercase flex items-center gap-2">
              <MapIcon className="h-4 w-4" /> RUTAS MAESTRAS
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <RoutesTable data={routes} pols={pols} pods={pods} />
            </div>
          </div>

          {/* --- BLOQUE 4: NAVIERAS (Morado) --- */}
          <div className={`${tableColumnClass} border-purple-200 min-w-[600px]`}>
            <div className="p-3 bg-purple-600 text-white font-bold text-xs uppercase flex items-center gap-2">
              <TruckIcon className="h-4 w-4" /> NAVIERA
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <ShippingLinesTable data={shippingLines} />
            </div>
          </div>

          {/* --- BLOQUE 5: BUQUES Y VIAJES (Fresa/Rosa) --- */}
          <div className="flex flex-nowrap gap-6 p-6 bg-rose-50/50 rounded-2xl border border-rose-100 min-w-max">
            <div className={`${tableColumnClass} border-rose-200 min-w-[600px]`}>
              <div className="p-3 bg-rose-600 text-white font-bold text-xs uppercase flex items-center gap-2">
                <LifebuoyIcon className="h-4 w-4" /> BUQUES
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                <VesselsTable data={vessels} />
              </div>
            </div>
            <div className={`${tableColumnClass} border-rose-200 min-w-[600px]`}>
              <div className="p-3 bg-rose-600 text-white font-bold text-xs uppercase flex items-center gap-2">
                <MapIcon className="h-4 w-4" /> VIAJES
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                <VoyagesTable data={voyages} vessels={vessels} />
              </div>
            </div>
          </div>

          {/* --- BLOQUE 6: OPERACIONES DE TERMINAL (Verde Esmeralda Claro) --- */}
          <div className="flex flex-nowrap gap-6 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 min-w-max">
            <div className={`${tableColumnClass} border-emerald-200`}>
              <div className="p-3 bg-emerald-400 text-white font-bold text-xs uppercase flex items-center gap-2">
                <BuildingOfficeIcon className="h-4 w-4" /> TERMINALES
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-white"><TerminalsTable data={terminals} ports={ports} /></div>
            </div>
            <div className={`${tableColumnClass} border-emerald-200`}>
              <div className="p-3 bg-emerald-400 text-white font-bold text-xs uppercase flex items-center gap-2">
                <TruckIcon className="h-4 w-4" /> SERVICIOS
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-white"><ServicesTable data={services} /></div>
            </div>
          </div>

          {/* --- BLOQUE 5: RESPONSABLES (Gris Slate) --- */}
          <div className={`${tableColumnClass} border-slate-200 min-w-[600px]`}>
            <div className="p-3 bg-slate-600 text-white font-bold text-xs uppercase flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4" /> RESPONSABLES
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <PeopleTable data={people} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
