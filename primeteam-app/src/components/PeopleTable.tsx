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

type Person = {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
};

const columnHelper = createColumnHelper<Person>()

export function PeopleTable({ data }: { data: Person[] }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ fullName: '', email: '', role: 'Operations' })
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Person>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar a esta persona?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/people/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      router.refresh();
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (person: Person) => {
    setEditingRowId(person._id);
    setEditedData({ fullName: person.fullName, email: person.email, role: person.role });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/people/${id}`, {
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
    if (!newData.fullName) return;
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error('Error');
      setIsCreating(false);
      setNewData({ fullName: '', email: '', role: 'Operations' });
      router.refresh();
    } catch (err) {
      alert('Error al crear');
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('fullName', {
      header: 'RESPONSABLE',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input type="text" value={editedData.fullName} onChange={e => setEditedData({...editedData, fullName: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black" />
      ) : (
        <div className="font-medium text-gray-900">{getValue() || 'N/A'}</div>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'CORREO',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <input type="email" value={editedData.email} onChange={e => setEditedData({...editedData, email: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black" />
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
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1.5 rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-500 transition-all">
            <PlusIcon className="-ml-0.5 h-4 w-4" /> Añadir Responsable
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
                  <tr className="bg-slate-50/50">
                    <td className="p-2"><input type="text" placeholder="Nombre..." value={newData.fullName} onChange={e => setNewData({...newData, fullName: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black" /></td>
                    <td className="p-2"><input type="email" placeholder="Email..." value={newData.email} onChange={e => setNewData({...newData, email: e.target.value})} className="w-full rounded border-gray-300 text-sm py-1 px-2 text-black" /></td>
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
