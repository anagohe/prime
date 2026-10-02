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

type Region = {
  _id: string;
  name: string;
};

const columnHelper = createColumnHelper<Region>()

export function RegionsTable({ data }: { data: Region[] }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta región?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/regions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      router.refresh();
    } catch (err) {
      alert('Error al eliminar la región');
    } finally {
      setIsDeleting(null);
    }
  }

  const handleEditClick = (region: Region) => {
    setEditingRowId(region._id);
    setEditedName(region.name);
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/regions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      setEditingRowId(null);
      router.refresh();
    } catch (err) {
      alert('Error al actualizar la región');
    }
  }

  const handleSaveNew = async () => {
    if (!newName.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    try {
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error('Error al crear');
      setIsCreating(false);
      setNewName('');
      router.refresh();
    } catch (err) {
      setError('Error al crear la región');
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input 
          type="text" 
          value={editedName} 
          onChange={(e) => setEditedName(e.target.value)}
          className="w-full rounded border-gray-300 text-black py-1 px-2 text-sm"
        />
      ) : (
        <div className="font-medium text-gray-900">{getValue() || 'No disponible'}</div>
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
  ], [editingRowId, editedName, isDeleting])

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
            className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            <PlusIcon className="-ml-0.5 h-4 w-4" />
            Añadir Región
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
                  <tr className="bg-blue-50/50">
                    <td className="py-2 pl-4 pr-3 sm:pl-0">
                      <input 
                        type="text" 
                        placeholder="Nombre de la región..." 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full rounded border-gray-300 text-black py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
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
