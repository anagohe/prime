import { client } from '@/lib/sanity.client'
import { voyagesQuery, vesselsQuery } from '@/lib/sanity.queries'
import { VoyagesTable } from '@/components/VoyagesTable'
import { CreateVoyageModal } from '@/components/CreateVoyageModal'

export default async function VoyagesPage() {
  const [voyages, vessels] = await Promise.all([
    client.fetch(voyagesQuery),
    client.fetch(vesselsQuery)
  ]);

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Voyages</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <CreateVoyageModal vessels={vessels} />
        </div>
      </div>
      
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">All Voyages</h3>
        <VoyagesTable data={voyages} />
      </div>
    </div>
  )
}
