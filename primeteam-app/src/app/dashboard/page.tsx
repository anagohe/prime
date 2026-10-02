import { client } from '@/lib/sanity.client'
import { 
  vesselsQuery,
  voyagesQuery
} from '@/lib/sanity.queries'

import { VesselsTable } from '@/components/VesselsTable'
import { VoyagesTable } from '@/components/VoyagesTable'

import { 
  CircleStackIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export default async function DashboardPage() {
  const [
    vessels, 
    voyages
  ] = await Promise.all([
    client.fetch(vesselsQuery),
    client.fetch(voyagesQuery)
  ])

  const tableColumnClass = "flex flex-col h-full shrink-0 shadow-lg rounded-xl border overflow-hidden transition-transform hover:scale-[1.01] duration-300";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="shrink-0 border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#1e4079]">Catálogo (BASE)</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-black mt-1">
          Data Cruda Operativa: Buques y Viajes
        </p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 custom-horizontal-scroll">
        <div className="inline-flex flex-nowrap gap-6 h-full items-start pr-20 pb-4">
          
          {/* --- VIAJES --- */}
          <div className={`${tableColumnClass} w-[500px] border-blue-900`}>
            <div className="p-3 bg-[#1e4079] text-white font-bold text-xs uppercase flex items-center gap-2">
              <CircleStackIcon className="h-4 w-4" /> Viajes
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <VoyagesTable data={voyages} vessels={vessels} />
            </div>
          </div>

          {/* --- BUQUES --- */}
          <div className={`${tableColumnClass} w-[500px] border-blue-900`}>
            <div className="p-3 bg-[#1e4079] text-white font-bold text-xs uppercase flex items-center gap-2">
              <Cog6ToothIcon className="h-4 w-4" /> Buques
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              <VesselsTable data={vessels} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

