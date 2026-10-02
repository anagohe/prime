'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { PlusIcon, CheckIcon, XMarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useNotification } from './Notification'

type Vessel = {
  _id: string;
  name?: string;
  imo?: string;
};

const columnHelper = createColumnHelper<Vessel>()

export function VesselsTable({ data }: { data: Vessel[] }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ name: '', imo: '' })
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Vessel>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este buque?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/vessels/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      showNotification('success', 'Eliminado', 'Buque eliminado correctamente');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al eliminar');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (vessel: Vessel) => {
    setEditingRowId(vessel._id);
    setEditedData({ name: vessel.name || '', imo: vessel.imo || '' });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editedData.name) {
      showNotification('error', 'Campo requerido', 'El nombre del buque es obligatorio');
      return;
    }
    try {
      const res = await fetch(`/api/vessels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData)
      });
      if (!res.ok) throw new Error('Error');
      showNotification('success', 'Actualizado', 'Buque actualizado correctamente');
      setEditingRowId(null);
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al actualizar');
    }
  };

  const handleSaveNew = async () => {
    if (!newData.name) {
      showNotification('error', 'Campo requerido', 'El nombre del buque es obligatorio');
      return;
    }
    try {
      const res = await fetch('/api/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error('Error');
      showNotification('success', 'Creado', 'Buque creado correctamente');
      setIsCreating(false);
      setNewData({ name: '', imo: '' });
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al crear');
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Nombre del Buque',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input type="text" value={editedData.name} onChange={e => setEditedData({...editedData, name: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2" />
      ) : (
        <div className="font-medium text-gray-900">{getValue() || 'N/A'}</div>
      ),
    }),
    columnHelper.accessor('imo', {
      header: 'Número IMO',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input type="text" value={editedData.imo} onChange={e => setEditedData({...editedData, imo: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2" />
      ) : (
        <span className="text-gray-500 font-mono text-xs">{getValue() || 'N/A'}</span>
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
              <button onClick={() => handleEditClick(row.original)} className="p-1.5 text-gray-400 hover:text-indigo-600"><PencilIcon className="h-5 w-5" /></button>
              <button onClick={() => handleDelete(row.original._id)} disabled={isDeleting === row.original._id} className="p-1.5 text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
            </>
          )}
        </div>
      ),
    })
  ], [editingRowId, editedData, isDeleting])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1.5 rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition-all">
            <PlusIcon className="-ml-0.5 h-4 w-4" /> Añadir Buque
          </button>
        )}
      </div>
      <div className="flow-root">
        <div className="-mx-4 -my-2">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(header => (
                      <th key={header.id} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isCreating && (
                  <tr className="bg-orange-50/50">
                    <td className="p-2"><input type="text" placeholder="Nombre..." value={newData.name} onChange={e => setNewData({...newData, name: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2" /></td>
                    <td className="p-2"><input type="text" placeholder="IMO..." value={newData.imo} onChange={e => setNewData({...newData, imo: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2" /></td>
                    <td className="p-2 text-right">
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
