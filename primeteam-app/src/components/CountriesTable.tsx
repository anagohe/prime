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

type Country = {
  _id: string;
  name?: string;
  iso3166?: string;
  region?: string;
  regionId?: string;
};

const columnHelper = createColumnHelper<Country>()

export function CountriesTable({ data, regions }: { data: Country[], regions: any[] }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ name: '', iso3166: '', regionId: '' })
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Country>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este país?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/countries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      router.refresh();
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (country: Country) => {
    setEditingRowId(country._id);
    setEditedData({ name: country.name, iso3166: country.iso3166, regionId: country.regionId });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/countries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData)
      });
      if (!res.ok) throw new Error('Error');
      setEditingRowId(null);
      router.refresh();
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const handleSaveNew = async () => {
    if (!newData.name) return;
    try {
      const res = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error('Error');
      setIsCreating(false);
      setNewData({ name: '', iso3166: '', regionId: '' });
      router.refresh();
    } catch (err) {
      alert('Error al crear');
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'País',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input type="text" value={editedData.name} onChange={e => setEditedData({...editedData, name: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black" />
      ) : (
        <div className="font-medium text-gray-900">{getValue() || 'N/A'}</div>
      ),
    }),
    columnHelper.accessor('iso3166', {
      header: 'ISO',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input type="text" value={editedData.iso3166} onChange={e => setEditedData({...editedData, iso3166: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black" />
      ) : (
        <span className="text-gray-500 font-bold uppercase">{getValue() || 'N/A'}</span>
      ),
    }),
    columnHelper.accessor('region', {
        header: 'Región',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <select value={editedData.regionId} onChange={e => setEditedData({...editedData, regionId: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black">
            <option value="">Región...</option>
            {regions.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        ) : (
          <span className="text-xs text-gray-400">{getValue() || 'N/A'}</span>
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
  ], [editingRowId, editedData, regions, isDeleting])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">
            <PlusIcon className="-ml-0.5 h-4 w-4" /> Añadir País
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
                  <tr className="bg-indigo-50/50">
                    <td className="p-2"><input type="text" placeholder="Nombre..." value={newData.name} onChange={e => setNewData({...newData, name: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black" /></td>
                    <td className="p-2"><input type="text" placeholder="ISO..." value={newData.iso3166} onChange={e => setNewData({...newData, iso3166: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black" /></td>
                    <td className="p-2">
                        <select value={newData.regionId} onChange={e => setNewData({...newData, regionId: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black">
                            <option value="">Región...</option>
                            {regions.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
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
