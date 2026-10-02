import { CountriesTable } from '@/components/CountriesTable'
import { client } from '@/lib/sanity.client'
import { countriesQuery, regionsQuery } from '@/lib/sanity.queries'

export default async function CountriesPage() {
  const countries = await client.fetch(countriesQuery)
  const regions = await client.fetch(regionsQuery)

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Catálogo de Países</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gestiona los países y sus regiones.
          </p>
        </div>
      </div>
      
      <CountriesTable data={countries} regions={regions} />
    </div>
  )
}
