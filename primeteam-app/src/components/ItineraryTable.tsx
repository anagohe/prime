'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { TrashIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { CreateItineraryModal } from './CreateItineraryModal'
import { formatDate } from '@/lib/utils'

type Itinerary = {
  _id: string
  shippingLine?: string
  shippingLineId?: string
  service?: string
  serviceId?: string
  route?: string
  routeId?: string
  voyage?: string
  voyageId?: string
  vessel?: string
  vesselId?: string
  pol?: string
  pod?: string
  terminal?: string
  terminalId?: string
  etd?: string
  eta?: string
  transit_time?: number
  final_etd?: string
  final_eta?: string
  final_transit_time_days?: number
  final_doc_closing?: string
  final_customs_closing?: string
  cargo_acceptance?: string
  fcl_lcl?: string
  tsPort?: string
  tsPortId?: string
  remarks?: string
}

const columnHelper = createColumnHelper<Itinerary>()

export function ItineraryTable({
  data,
  shippingLines,
  routes,
  vessels,
  terminals,
  services,
  voyages,
  ports,
  routeLineConfigs,
}: {
  data: Itinerary[]
  shippingLines: any[]
  routes: any[]
  vessels: any[]
  terminals: any[]
  services: any[]
  voyages: any[]
  ports: any[]
  routeLineConfigs: any[]
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtering states
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [fclOnly, setFclOnly] = useState(true)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este itinerario?')) return
    setIsDeleting(id)
    try {
      const res = await fetch(`/api/itineraries/${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al eliminar')
      }

      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el itinerario')
    } finally {
      setIsDeleting(null)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('pol', {
        header: 'POL',
        cell: (info) => <div className="text-xs font-semibold text-gray-900">{info.getValue() || 'N/A'}</div>,
      }),
      columnHelper.accessor('pod', {
        header: 'POD',
        cell: (info) => <div className="text-xs font-semibold text-gray-900">{info.getValue() || 'N/A'}</div>,
      }),
      columnHelper.accessor('vessel', {
        header: 'Buque',
        cell: (info) => <div className="text-xs font-bold text-gray-900">{info.getValue() || 'N/A'}</div>,
      }),
      columnHelper.accessor('voyage', {
        header: 'Viaje',
        cell: (info) => <div className="text-xs font-medium text-gray-600">{info.getValue() || 'N/A'}</div>,
      }),
      columnHelper.accessor('cargo_acceptance', {
        header: 'ACEPTACION DE CARGA DG',
        cell: (info) => {
          const val = info.getValue()
          const isSi = val === 'SI' || val === 'ACEPTA'
          const isNo = val === 'NO' || val === 'NO ACEPTA'

          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                isSi
                  ? 'bg-green-100 text-green-700'
                  : isNo
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {val || 'TBA'}
            </span>
          )
        },
      }),
      columnHelper.accessor('shippingLine', {
        header: 'Naviera',
        cell: (info) => <div className="font-bold text-[#1e4079] text-xs">{info.getValue() || 'N/A'}</div>,
      }),
      columnHelper.accessor('etd', {
        header: 'ETD',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1e4079]">
              {formatDate(info.row.original.final_etd || info.getValue())}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('final_doc_closing', {
        header: 'Cierre Doc.',
        cell: (info) => <div className="text-[10px] font-bold text-gray-500">{formatDate(info.getValue())}</div>,
      }),
      columnHelper.accessor('final_customs_closing', {
        header: 'Cierre Aduana',
        cell: (info) => <div className="text-[10px] font-bold text-gray-500">{formatDate(info.getValue())}</div>,
      }),
      columnHelper.accessor('eta', {
        header: 'ETA',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1e4079]">
              {formatDate(info.row.original.final_eta || info.getValue())}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('transit_time', {
        header: 'T/T',
        cell: (info) => (
          <div className="text-xs font-black text-gray-700">
            {info.row.original.final_transit_time_days || info.getValue() || '--'} d
          </div>
        ),
      }),
      columnHelper.accessor('service', {
        header: 'Servicio',
        cell: (info) => <div className="text-[10px] font-bold text-gray-500">{info.getValue() || 'N/A'}</div>,
      }),
      columnHelper.accessor('terminal', {
        header: 'Terminal de Origen',
        cell: (info) => <div className="text-[10px] font-bold text-gray-500">{info.getValue() || 'N/A'}</div>,
      }),
      columnHelper.accessor('fcl_lcl', {
        header: 'FCL / LCL',
        cell: (info) => <div className="text-[10px] font-bold text-gray-500">{info.getValue() || 'TBA'}</div>,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="text-right w-full block">Acciones</span>,
        cell: ({ row }) => (
          <div className="text-right whitespace-nowrap space-x-2">
            <button
              onClick={() => {
                setEditingItinerary(row.original)
                setIsModalOpen(true)
              }}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Editar"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original._id)}
              disabled={isDeleting === row.original._id}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
              title="Eliminar"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ),
      }),
    ],
    [isDeleting]
  )

  const filteredData = useMemo(() => {
    let result = data
    if (fclOnly) {
      result = result.filter((it) => it.fcl_lcl === 'FCL' || !it.fcl_lcl)
    } else {
      result = result.filter((it) => it.fcl_lcl === 'LCL')
    }
    return result
  }, [data, fclOnly])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en tabla..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
          />
        </div>

        <select
          value={(table.getColumn('shippingLine')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('shippingLine')?.setFilterValue(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
        >
          <option value="">Todas las Navieras</option>
          {shippingLines.map((sl) => (
            <option key={sl._id} value={sl.name}>
              {sl.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
          <span className="text-[10px] font-bold text-gray-500 uppercase">FCL</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!fclOnly}
              onChange={() => setFclOnly(!fclOnly)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
          <span className="text-[10px] font-bold text-gray-500 uppercase">LCL</span>
        </div>

        <input
          type="date"
          placeholder="Cierre Documental"
          onChange={(e) => table.getColumn('final_doc_closing')?.setFilterValue(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black"
          title="Filtrar por Cierre Documental"
        />
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex flex-col">
          <h4 className="text-sm font-bold text-gray-700">Gestión de Itinerarios</h4>
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
            Total de registros: {data.length}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItinerary(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Nuevo Itinerario
        </button>

        <CreateItineraryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itineraryToEdit={editingItinerary}
          shippingLines={shippingLines}
          routes={routes}
          vessels={vessels}
          terminals={terminals}
          services={services}
          voyages={voyages}
          ports={ports}
          routeLineConfigs={routeLineConfigs}
        />
      </div>

      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          scope="col"
                          className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-gray-400 italic">
                        No se encontraron itinerarios registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}