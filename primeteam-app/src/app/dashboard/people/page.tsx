import { PeopleTable } from '@/components/PeopleTable'
import { client } from '@/lib/sanity.client'
import { peopleQuery } from '@/lib/sanity.queries'

export default async function PeoplePage() {
  const people = await client.fetch(peopleQuery)

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Personal</h1>
        <p className="mt-2 text-sm text-gray-500">
          Añade, edita o elimina personal y responsables de ruta.
        </p>
      </div>
      
      <div className="max-w-4xl"> {/* Limita el ancho para una mejor visualización de una tabla simple */}
        <PeopleTable data={people} />
      </div>
    </div>
  )
}
