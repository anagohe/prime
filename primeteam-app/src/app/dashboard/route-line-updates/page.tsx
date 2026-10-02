import { RouteLineUpdatesTable } from '@/components/RouteLineUpdatesTable'
import { client } from '@/lib/sanity.client'
import { routeLineUpdatesQuery, routesQuery, shippingLinesQuery } from '@/lib/sanity.queries'

export default async function RouteLineUpdatesPage() {
  const [updates, routes, shippingLines] = await Promise.all([
    client.fetch(routeLineUpdatesQuery),
    client.fetch(routesQuery),
    client.fetch(shippingLinesQuery),
  ]);

  // El query de rutas y navieras devuelve más campos de los que el dropdown necesita, lo simplificamos.
  const routeRefs = routes.map((r: any) => ({ _id: r._id, label: r.label }))
  const shippingLineRefs = shippingLines.map((s: any) => ({ _id: s._id, name: s.name }))

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Actualización de Líneas en Ruta</h1>
        <p className="mt-2 text-sm text-gray-500">
          Registra cuándo se actualizó por última vez una naviera en una ruta específica.
        </p>
      </div>
      
      <RouteLineUpdatesTable data={updates} routes={routeRefs} shippingLines={shippingLineRefs} />
    </div>
  )
}
