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

type Route = {
  _id: string;
  label?: string;
  originPort?: string;
  originPortId?: string;
  destinationPort?: string;
  destinationPortId?: string;
};

const columnHelper = createColumnHelper<Route>()

export function RoutesTable({ data, pols, pods }: { data: Route[], pols: any[], pods: any[] }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ originPortId: '', destinationPortId: '' })
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{ originPortId?: string, destinationPortId?: string }>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta ruta?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/routes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      showNotification('success', 'Ruta eliminada', 'La ruta se ha eliminado correctamente.');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al eliminar la ruta.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (route: Route) => {
    setEditingRowId(route._id);
    setEditedData({ originPortId: route.originPortId, destinationPortId: route.destinationPortId });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/routes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pol: editedData.originPortId,
            pod: editedData.destinationPortId
        })
      });
      if (!res.ok) throw new Error('Error');
      setEditingRowId(null);
      showNotification('success', 'Actualizado', 'Ruta actualizada correctamente.');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al actualizar la ruta.');
    }
  };

  const handleSaveNew = async () => {
    if (!newData.originPortId || !newData.destinationPortId) {
        showNotification('error', 'Campos obligatorios', 'Selecciona tanto el origen como el destino.');
        return;
    }
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pol: newData.originPortId,
            pod: newData.destinationPortId
        })
      });
      if (!res.ok) throw new Error('Error');
      setIsCreating(false);
      setNewData({ originPortId: '', destinationPortId: '' });
      showNotification('success', 'Ruta creada', 'Nueva ruta maestra creada correctamente.');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al crear la ruta.');
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('label', {
      header: 'Ruta Automática',
      cell: ({ getValue }) => (
        <div className="font-bold text-[#1e4079] uppercase tracking-tighter">{getValue() || 'N/A'}</div>
      ),
    }),
    columnHelper.accessor('originPort', {
      header: 'POL',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <select value={editedData.originPortId} onChange={e => setEditedData({...editedData, originPortId: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2 font-bold bg-white">
          <option value="">POL...</option>
          {pols.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      ) : (
        <span className="text-gray-900 text-xs font-bold">{getValue() || 'N/A'}</span>
      ),
    }),
    columnHelper.accessor('destinationPort', {
        header: 'POD',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <select value={editedData.destinationPortId} onChange={e => setEditedData({...editedData, destinationPortId: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2 font-bold bg-white">
            <option value="">POD...</option>
            {pods.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        ) : (
          <span className="text-gray-900 text-xs font-bold">{getValue() || 'N/A'}</span>
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
  ], [editingRowId, editedData, pols, pods, isDeleting])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1.5 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-all">
            <PlusIcon className="-ml-0.5 h-4 w-4" /> Añadir Ruta
          </button>
        )}
      </div>
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto">
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
                  <tr className="bg-purple-50/50">
                    <td className="p-2 italic text-gray-400 text-xs">Se genera automáticamente...</td>
                    <td className="p-2">
                        <select value={newData.originPortId} onChange={e => setNewData({...newData, originPortId: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2 font-bold bg-white">
                            <option value="">POL...</option>
                            {pols.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </td>
                    <td className="p-2">
                        <select value={newData.destinationPortId} onChange={e => setNewData({...newData, destinationPortId: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2 font-bold bg-white">
                            <option value="">POD...</option>
                            {pods.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </td>
                    <td className="p-2 text-right">
                       <button onClick={handleSaveNew} className="p-1.5 text-green-600 hover:text-green-800"><CheckIcon className="h-5 w-5" /></button>
                       <button onClick={() => setIsCreating(false)} className="p-1.5 text-red-600 hover:text-red-800"><XMarkIcon className="h-5 w-5" /></button>
                    </td>
                  </tr>
                )}
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
