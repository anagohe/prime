import { client } from '@/lib/sanity.client'
import { 
  routeLineConfigsQuery, 
  routesQuery, 
  shippingLinesQuery, 
  servicesQuery, 
  terminalsQuery 
} from '@/lib/sanity.queries'
import { RouteLineConfigsTable } from '@/components/RouteLineConfigsTable'
import { CreateRouteLineConfigModal } from '@/components/CreateRouteLineConfigModal'

export default async function RouteLineConfigsPage() {
  const [configs, routes, shippingLines, services, terminals] = await Promise.all([
    client.fetch(routeLineConfigsQuery),
    client.fetch(routesQuery),
    client.fetch(shippingLinesQuery),
    client.fetch(servicesQuery),
    client.fetch(terminalsQuery),
  ]);

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Route Line Configurations</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <CreateRouteLineConfigModal 
            routes={routes}
            shippingLines={shippingLines}
            services={services}
            terminals={terminals}
          />
        </div>
      </div>
      
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">All Configurations</h3>
        <RouteLineConfigsTable 
          data={configs} 
          routes={routes}
          shippingLines={shippingLines}
          services={services}
          terminals={terminals}
        />
      </div>
    </div>
  )
}
