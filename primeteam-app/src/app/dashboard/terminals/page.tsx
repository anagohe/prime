import { TerminalsTable } from '@/components/TerminalsTable'
import { client } from '@/lib/sanity.client'
import { terminalsQuery, portsQuery } from '@/lib/sanity.queries'

// Hacemos la página un Server Component asíncrono
export default async function TerminalsPage() {
  // Obtenemos ambos listados de datos en paralelo
  const [terminals, ports] = await Promise.all([
    client.fetch(terminalsQuery),
    client.fetch(portsQuery)
  ]);

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Catálogo de Terminales</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gestiona las terminales.
          </p>
        </div>
      </div>
      
      <TerminalsTable data={terminals} ports={ports} />
    </div>
  )
}
