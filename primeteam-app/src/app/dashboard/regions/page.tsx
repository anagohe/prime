import { client } from '@/lib/sanity.client'
import { regionsQuery } from '@/lib/sanity.queries'
import { RegionsTable } from '@/components/RegionsTable'
import { CreateRegionModal } from '@/components/CreateRegionModal'

export default async function RegionsPage() {
  const regions = await client.fetch(regionsQuery)

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Regions</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <CreateRegionModal />
        </div>
      </div>
      
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">All Regions</h3>
        <RegionsTable data={regions} />
      </div>
    </div>
  )
}
