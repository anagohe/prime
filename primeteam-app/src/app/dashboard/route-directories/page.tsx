import { RouteDirectoriesTable } from '@/components/RouteDirectoriesTable'
import { client } from '@/lib/sanity.client'
import { routeDirectoriesQuery, routesQuery, peopleQuery } from '@/lib/sanity.queries'

export default async function RouteDirectoryPage() {
  const [directories, routes, people] = await Promise.all([
    client.fetch(routeDirectoriesQuery),
    client.fetch(routesQuery),
    client.fetch(peopleQuery),
  ]);

  // El query de rutas devuelve más campos de los que el dropdown necesita, lo simplificamos.
  const routeRefs = routes.map((r: any) => ({ _id: r._id, label: r.label }))

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Directorio de Rutas</h1>
        <p className="mt-2 text-sm text-gray-500">
          Asigna responsables y reglas a las rutas logísticas.
        </p>
      </div>
      
      <RouteDirectoriesTable data={directories} routes={routeRefs} people={people} />
    </div>
  )
}
