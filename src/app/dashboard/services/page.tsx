import { client } from '@/lib/sanity.client'
import { servicesQuery } from '@/lib/sanity.queries'
import { ServicesTable } from '@/components/ServicesTable'
import { CreateServiceModal } from '@/components/CreateServiceModal'

export default async function ServicesPage() {
  const services = await client.fetch(servicesQuery)

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Services</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <CreateServiceModal />
        </div>
      </div>
      
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">All Services</h3>
        <ServicesTable data={services} />
      </div>
    </div>
  )
}
