import { RoutesTable } from '@/components/RoutesTable'
import { client } from '@/lib/sanity.client'
import { routesQuery, portsQuery } from '@/lib/sanity.queries'
import { 
  ArrowPathIcon, 
  ArrowDownOnSquareIcon, 
  PlusIcon, 
  DocumentDuplicateIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline'

// Hacemos la página un Server Component asíncrono
export default async function RoutesPage() {
  // Obtenemos ambos listados de datos en paralelo
  const [routes, ports] = await Promise.all([
    client.fetch(routesQuery),
    client.fetch(portsQuery)
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-50/50 min-h-[calc(100vh-4rem)]">
      
      {/* --- 1. HEADER & GLOBAL ACTIONS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e4079]">Routes</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Optimize and manage travel routes
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-amber-400 text-white text-sm font-bold rounded-lg hover:bg-amber-500 transition-colors shadow-sm shadow-amber-200">
            <ArrowDownOnSquareIcon className="w-4 h-4" />
            Save All Changes
          </button>
        </div>
      </div>

      {/* --- 2. TOOLBAR & STATS BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-4">
        
        {/* Action Buttons (Left) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#6eafa4] text-white text-sm font-semibold rounded-md hover:bg-[#5c9c6d] shadow-sm transition-colors">
            <PlusIcon className="w-4 h-4" />
            Add New Row
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 shadow-sm transition-colors">
            <DocumentDuplicateIcon className="w-4 h-4" />
            Duplicate
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-100 text-red-500 text-sm font-medium rounded-md hover:bg-red-50 shadow-sm transition-colors">
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Data Stats (Right) - Visual Placeholder based on image */}
        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
           <div className="flex gap-1">
             <span>Total:</span> <strong className="text-gray-800">{routes.length} rows</strong>
           </div>
           <span className="text-gray-300">|</span>
           <div className="flex gap-1">
             <span>Valid:</span> <strong className="text-green-600">{routes.length}</strong>
           </div>
           <span className="text-gray-300">|</span>
           <div className="flex gap-1">
             <span>Modified:</span> <strong className="text-amber-500">0</strong>
           </div>
           <span className="text-gray-300">|</span>
           <div className="flex gap-1">
             <span>Selected:</span> <strong className="text-[#1e4079]">0</strong>
           </div>
        </div>
      </div>
      
      {/* --- 3. MAIN TABLE AREA --- */}
      {/* El componente RoutesTable se encarga del grid interno. 
          Asumimos que tiene su propio header azul oscuro o estilo de tabla. */}
      <div className="flex-grow bg-white border border-gray-200 shadow-sm rounded-t-lg overflow-hidden">
        <RoutesTable data={routes} pols={ports} pods={ports} />
      </div>

      {/* --- 4. FOOTER LEGEND --- */}
      <div className="bg-white border-x border-b border-gray-200 p-3 rounded-b-lg flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm mb-8">
         
         {/* Color Legends */}
         <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded bg-green-100 border border-green-200"></span> Valid Record
            </div>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></span> Modified
            </div>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></span> New Row
            </div>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded border border-amber-400 ring-1 ring-amber-400/30"></span> Active Cell
            </div>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></span> Selected
            </div>
         </div>

         {/* Tip */}
         <div className="text-xs text-gray-500 font-medium">
           <span className="text-gray-400 mr-1">Tip:</span> Double-click any cell to edit · Use Tab to navigate
         </div>

      </div>

    </div>
  )
}