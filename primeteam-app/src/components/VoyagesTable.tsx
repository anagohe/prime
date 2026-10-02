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
import { useNotification } from './Notification'

type Voyage = {
  _id: string;
  voyageCode?: string;
  vessel?: string;
  vesselId?: string;
};

const columnHelper = createColumnHelper<Voyage>()

export function VoyagesTable({ data, vessels }: { data: Voyage[], vessels: any[] }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState({ voyageCode: '', vesselId: '' })
  
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ voyageCode: '', vesselId: '' })
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este viaje?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/voyages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      showNotification('success', 'Eliminado', 'Viaje eliminado correctamente');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al eliminar');
    } finally {
      setIsDeleting(null);
    }
  }

  const handleEditClick = (voyage: Voyage) => {
    setEditingRowId(voyage._id);
    setEditedData({ 
      voyageCode: voyage.voyageCode || '', 
      vesselId: voyage.vesselId || '' 
    });
  }

  const handleSaveEdit = async (id: string) => {
    if (!editedData.voyageCode.trim()) {
      showNotification('error', 'Campo requerido', 'El código de viaje es obligatorio');
      return;
    }
    try {
      const res = await fetch(`/api/voyages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });
      if (!res.ok) throw new Error('Error');
      showNotification('success', 'Actualizado', 'Viaje actualizado correctamente');
      setEditingRowId(null);
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al actualizar');
    }
  }

  const handleSaveNew = async () => {
    if (!newData.voyageCode.trim()) {
      showNotification('error', 'Campo requerido', 'El código es obligatorio');
      return;
    }
    try {
      const res = await fetch('/api/voyages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error('Error');
      showNotification('success', 'Creado', 'Viaje creado correctamente');
      setIsCreating(false);
      setNewData({ voyageCode: '', vesselId: '' });
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al crear');
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('voyageCode', {
      header: 'Viaje',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input 
          type="text" 
          value={editedData.voyageCode} 
          onChange={(e) => setEditedData({...editedData, voyageCode: e.target.value})}
          className="w-full rounded border-gray-300 text-black py-1 px-2 text-sm"
        />
      ) : (
        <div className="font-medium text-gray-900">{getValue() || 'No disponible'}</div>
      ),
    }),
    columnHelper.accessor('vessel', {
      header: 'Buque',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <select 
          value={editedData.vesselId} 
          onChange={(e) => setEditedData({...editedData, vesselId: e.target.value})}
          className="w-full rounded border-gray-300 text-black py-1 px-2 text-sm"
        >
          <option value="">Seleccionar buque...</option>
          {vessels.map((v: any) => <option key={v._id} value={v._id}>{v.name}</option>)}
        </select>
      ) : (
        <div className="text-gray-600">{getValue() || 'Por confirmar'}</div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right w-full block">Acciones</span>,
      cell: ({ row }) => (
        <div className="text-right whitespace-nowrap">
          {editingRowId === row.original._id ? (
            <>
              <button onClick={() => handleSaveEdit(row.original._id)} className="p-1.5 text-green-600 hover:text-green-800"><CheckIcon className="h-5 w-5" /></button>
              <button onClick={() => setEditingRowId(null)} className="p-1.5 text-red-600 hover:text-red-800"><XMarkIcon className="h-5 w-5" /></button>
            </>
          ) : (
            <>
              <button onClick={() => handleEditClick(row.original)} className="p-1.5 text-gray-500 hover:text-indigo-600"><PencilIcon className="h-5 w-5" /></button>
              <button onClick={() => handleDelete(row.original._id)} disabled={isDeleting === row.original._id} className="p-1.5 text-gray-500 hover:text-red-600 disabled:opacity-50"><TrashIcon className="h-5 w-5" /></button>
            </>
          )}
        </div>
      ),
    }),
  ], [editingRowId, editedData, isDeleting, vessels])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1 rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition-all">
            <PlusIcon className="h-4 w-4" /> Añadir Viaje
          </button>
        )}
      </div>
      {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
      <div className="flow-root">
        <div className="-mx-4 -my-2">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isCreating && (
                  <tr className="bg-orange-50/50">
                    <td className="py-2 pl-4 pr-3 sm:pl-0">
                      <input type="text" placeholder="Código..." value={newData.voyageCode} onChange={(e) => setNewData({...newData, voyageCode: e.target.value})} className="w-full rounded border-gray-300 text-black py-1 px-2 text-sm" />
                    </td>
                    <td className="py-2 pl-4 pr-3 sm:pl-0">
                      <select value={newData.vesselId} onChange={(e) => setNewData({...newData, vesselId: e.target.value})} className="w-full rounded border-gray-300 text-black py-1 px-2 text-sm">
                        <option value="">Seleccionar buque...</option>
                        {vessels.map((v: any) => <option key={v._id} value={v._id}>{v.name}</option>)}
                      </select>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <button onClick={handleSaveNew} className="p-1.5 text-green-600 hover:text-green-800"><CheckIcon className="h-5 w-5" /></button>
                      <button onClick={() => setIsCreating(false)} className="p-1.5 text-red-600 hover:text-red-800"><XMarkIcon className="h-5 w-5" /></button>
                    </td>
                  </tr>
                )}
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-700 sm:pl-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
