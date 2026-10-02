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

type Terminal = {
  _id: string;
  name?: string;
  port?: string;
  portId?: string;
};

const columnHelper = createColumnHelper<Terminal>()

export function TerminalsTable({ data, ports }: { data: Terminal[], ports: any[] }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ name: '', portId: '' })
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Terminal>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta terminal?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/terminals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      router.refresh();
    } catch (err) {
      alert('Error al eliminar la terminal');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (term: Terminal) => {
    setEditingRowId(term._id);
    // IMPORTANTE: Aseguramos que portId tenga un valor inicial para el select
    setEditedData({ 
      name: term.name, 
      portId: term.portId || term.port 
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/terminals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos 'port' para que el backend lo reconozca
        body: JSON.stringify({
          name: editedData.name,
          port: editedData.portId 
        })
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setEditingRowId(null);
      router.refresh();
    } catch (err) {
      alert('Error al actualizar la terminal');
    }
  };

  const handleSaveNew = async () => {
    if (!newData.name || !newData.portId) {
      alert('Nombre y Puerto son obligatorios');
      return;
    }
    try {
      const res = await fetch('/api/terminals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Sincronizamos con el backend usando 'port'
        body: JSON.stringify({
          name: newData.name,
          port: newData.portId
        })
      });
      if (!res.ok) throw new Error('Error al crear');
      setIsCreating(false);
      setNewData({ name: '', portId: '' });
      router.refresh();
    } catch (err) {
      alert('Error al crear la terminal');
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'TERMINAL',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input 
          type="text" 
          value={editedData.name || ''} 
          onChange={e => setEditedData({...editedData, name: e.target.value})} 
          className="w-full rounded border-gray-300 text-black text-sm py-1 px-2 focus:ring-teal-500" 
        />
      ) : (
        <div className="font-medium text-gray-900">{getValue() || 'N/A'}</div>
      ),
    }),
    columnHelper.accessor('port', {
      header: 'Puerto',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <select 
          value={editedData.portId || ''} 
          onChange={e => setEditedData({...editedData, portId: e.target.value})} 
          className="w-full rounded border-gray-300 text-black text-sm py-1 px-2 focus:ring-teal-500"
        >
          <option value="">Seleccionar...</option>
          {ports.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      ) : (
        <span className="text-gray-500">{getValue() || 'N/A'}</span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right w-full block">Acciones</span>,
      cell: ({ row }) => (
        <div className="text-right whitespace-nowrap">
          {editingRowId === row.original._id ? (
            <>
              <button onClick={() => handleSaveEdit(row.original._id)} className="p-1.5 text-green-600 hover:text-green-800" title="Guardar"><CheckIcon className="h-5 w-5" /></button>
              <button onClick={() => setEditingRowId(null)} className="p-1.5 text-red-600 hover:text-red-800" title="Cancelar"><XMarkIcon className="h-5 w-5" /></button>
            </>
          ) : (
            <>
              <button onClick={() => handleEditClick(row.original)} className="p-1.5 text-gray-400 hover:text-indigo-600" title="Editar"><PencilIcon className="h-5 w-5" /></button>
              <button onClick={() => handleDelete(row.original._id)} disabled={isDeleting === row.original._id} className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50" title="Eliminar"><TrashIcon className="h-5 w-5" /></button>
            </>
          )}
        </div>
      ),
    })
  ], [editingRowId, editedData, ports, isDeleting])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1.5 rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-all">
            <PlusIcon className="-ml-0.5 h-4 w-4" /> Añadir Terminal
          </button>
        )}
      </div>
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
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
                  <tr className="bg-teal-50/50">
                    <td className="p-2">
                      <input 
                        type="text" 
                        placeholder="Nombre..." 
                        value={newData.name} 
                        onChange={e => setNewData({...newData, name: e.target.value})} 
                        className="w-full rounded border-gray-300 text-black text-sm py-1 px-2 focus:ring-teal-500" 
                      />
                    </td>
                    <td className="p-2">
                        <select 
                          value={newData.portId} 
                          onChange={e => setNewData({...newData, portId: e.target.value})} 
                          className="w-full rounded border-gray-300 text-black text-sm py-1 px-2 focus:ring-teal-500"
                        >
                            <option value="">Puerto...</option>
                            {ports.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </td>
                    <td className="p-2 text-right">
                       <button onClick={handleSaveNew} className="p-1.5 text-green-600 hover:text-green-800" title="Guardar"><CheckIcon className="h-5 w-5" /></button>
                       <button onClick={() => setIsCreating(false)} className="p-1.5 text-red-600 hover:text-red-800" title="Cancelar"><XMarkIcon className="h-5 w-5" /></button>
                    </td>
                  </tr>
                )}
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-700 sm:pl-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
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