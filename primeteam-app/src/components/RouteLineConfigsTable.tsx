'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

type Config = {
  _id: string;
  route?: string;
  routeId?: string;
  shippingLine?: string;
  shippingLineId?: string;
  service?: string;
  serviceId?: string;
  terminal?: string;
  terminalId?: string;
  cargo_acceptance?: string;
};

const columnHelper = createColumnHelper<Config>()

export function RouteLineConfigsTable({ 
  data, 
  routes, 
  shippingLines, 
  services, 
  terminals 
}: { 
  data: Config[], 
  routes: any[], 
  shippingLines: any[], 
  services: any[], 
  terminals: any[] 
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState({ routeId: '', shippingLineId: '', serviceId: '', terminalId: '', cargo_acceptance: '' })
  
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ routeId: '', shippingLineId: '', serviceId: '', terminalId: '', cargo_acceptance: 'ACEPTA' })
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta configuración?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/route-line-configs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      router.refresh();
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setIsDeleting(null);
    }
  }

  const handleSaveNew = async () => {
    if (!newData.routeId || !newData.shippingLineId) {
      setError('Ruta y Naviera son obligatorios');
      return;
    }
    try {
      const res = await fetch('/api/route-line-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error('Error');
      setIsCreating(false);
      router.refresh();
    } catch (err) {
      setError('Error al crear la configuración');
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('route', {
      header: 'Ruta',
      cell: info => <div className="font-medium text-gray-900">{info.getValue() || 'N/A'}</div>,
    }),
    columnHelper.accessor('shippingLine', {
      header: 'Naviera',
      cell: info => <div className="text-gray-600">{info.getValue() || 'N/A'}</div>,
    }),
    columnHelper.accessor('service', {
        header: 'Servicio',
        cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('cargo_acceptance', {
        header: 'Aceptación',
        cell: info => (
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${info.getValue() === 'ACEPTA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {info.getValue() || 'ACEPTA'}
          </span>
        ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right w-full block">Acciones</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <button onClick={() => handleDelete(row.original._id)} disabled={isDeleting === row.original._id} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"><TrashIcon className="h-4 w-4" /></button>
        </div>
      ),
    }),
  ], [isDeleting])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1 rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-500 transition-all">
            <PlusIcon className="h-4 w-4" /> Configurar Línea
          </button>
        )}
      </div>
      {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
      
      <div className="flow-root">
        <div className="-mx-4 -my-2">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isCreating && (
                <tr className="bg-fuchsia-50/50 text-xs">
                  <td className="p-2">
                    <select value={newData.routeId} onChange={e => setNewData({...newData, routeId: e.target.value})} className="w-full rounded border-gray-300 text-black py-1 text-xs">
                      <option value="">Ruta...</option>
                      {routes.map((r: any) => <option key={r._id} value={r._id}>{r.label}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <select value={newData.shippingLineId} onChange={e => setNewData({...newData, shippingLineId: e.target.value})} className="w-full rounded border-gray-300 text-black py-1 text-xs">
                      <option value="">Naviera...</option>
                      {shippingLines.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <select value={newData.serviceId} onChange={e => setNewData({...newData, serviceId: e.target.value})} className="w-full rounded border-gray-300 text-black py-1 text-xs">
                      <option value="">Servicio...</option>
                      {services.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <select value={newData.cargo_acceptance} onChange={e => setNewData({...newData, cargo_acceptance: e.target.value})} className="w-full rounded border-gray-300 text-black py-1 text-xs">
                      <option value="ACEPTA">ACEPTA</option>
                      <option value="NO ACEPTA">NO ACEPTA</option>
                    </select>
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    <button onClick={handleSaveNew} className="p-1 text-green-600 hover:text-green-800"><CheckIcon className="h-5 w-5" /></button>
                    <button onClick={() => setIsCreating(false)} className="p-1 text-red-600 hover:text-red-800"><XMarkIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-700">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
