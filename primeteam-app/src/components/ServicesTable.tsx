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

type Service = {
  _id: string;
  name?: string;
  code?: string;
};

const columnHelper = createColumnHelper<Service>()

export function ServicesTable({ data }: { data: Service[] }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState({ name: '', code: '' })
  
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ name: '', code: '' })
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      router.refresh();
    } catch (err) {
      alert('Error al eliminar el servicio');
    } finally {
      setIsDeleting(null);
    }
  }

  const handleEditClick = (service: Service) => {
    setEditingRowId(service._id);
    setEditedData({ name: service.name || '', code: service.code || '' });
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setEditingRowId(null);
      router.refresh();
    } catch (err) {
      alert('Error al actualizar el servicio');
    }
  }

  const handleSaveNew = async () => {
    if (!newData.code.trim()) {
      setError('El código es obligatorio');
      return;
    }
    try {
      // If name is required by API, use code as name as well
      const payload = { 
        name: newData.name.trim() || newData.code.trim(), 
        code: newData.code.trim() 
      };
      
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al crear');
      setIsCreating(false);
      setNewData({ name: '', code: '' });
      router.refresh();
    } catch (err) {
      setError('Error al crear el servicio');
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('code', {
      header: 'Código',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input 
          type="text" 
          value={editedData.code} 
          onChange={(e) => setEditedData({...editedData, code: e.target.value, name: e.target.value})}
          className="w-full rounded border-gray-300 text-black py-1 px-2 text-sm"
        />
      ) : (
        getValue() || 'No disponible'
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right w-full block">Acciones</span>,
      cell: ({ row }) => {
        const isEditing = editingRowId === row.original._id;
        return (
          <div className="text-right whitespace-nowrap">
            {isEditing ? (
              <>
                <button onClick={() => handleSaveEdit(row.original._id)} className="p-1.5 text-green-600 hover:text-green-800" title="Guardar"><CheckIcon className="h-5 w-5" /></button>
                <button onClick={() => setEditingRowId(null)} className="p-1.5 text-red-600 hover:text-red-800" title="Cancelar"><XMarkIcon className="h-5 w-5" /></button>
              </>
            ) : (
              <>
                <button onClick={() => handleEditClick(row.original)} className="p-1.5 text-gray-500 hover:text-indigo-600" title="Editar"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => handleDelete(row.original._id)} disabled={isDeleting === row.original._id} className="p-1.5 text-gray-500 hover:text-red-600 disabled:opacity-50" title="Eliminar"><TrashIcon className="h-5 w-5" /></button>
              </>
            )}
          </div>
        );
      },
    }),
  ], [editingRowId, editedData, isDeleting])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 transition-all"
          >
            <PlusIcon className="-ml-0.5 h-4 w-4" />
            Añadir Servicio
          </button>
        )}
      </div>

      {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</div>}

      <div className="flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isCreating && (
                  <tr className="bg-yellow-50/50">
                    <td className="py-2 pl-4 pr-3 sm:pl-0">
                      <input 
                        type="text" 
                        placeholder="Código..." 
                        value={newData.code}
                        onChange={(e) => setNewData({...newData, code: e.target.value, name: e.target.value})}
                        className="w-full rounded border-gray-300 text-black py-1 px-2 text-sm"
                      />
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
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
