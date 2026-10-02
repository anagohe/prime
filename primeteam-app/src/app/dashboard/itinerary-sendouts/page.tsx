import { ItinerarySendoutsTable } from '@/components/ItinerarySendoutsTable'
import { client } from '@/lib/sanity.client'
import { itinerarySendoutsQuery, routesQuery, peopleQuery } from '@/lib/sanity.queries'
import { 
  ArrowPathIcon, 
} from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ItinerarySendoutsPage() {
  const [sendouts, routes, people] = await Promise.all([
    client.fetch(itinerarySendoutsQuery),
    client.fetch(routesQuery),
    client.fetch(peopleQuery)
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-50/50 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e4079]">Envío de Itinerarios</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Registro y control de envíos de itinerarios por ruta
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowPathIcon className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      <div className="flex-grow bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden p-4">
        <ItinerarySendoutsTable data={sendouts} routes={routes} people={people} />
      </div>

    </div>
  )
}
