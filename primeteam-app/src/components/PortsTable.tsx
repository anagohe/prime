'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { CheckIcon, XMarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { CreatePortFullModal } from './CreatePortFullModal'

type Port = {
  _id: string;
  name?: string;
  code?: string;
  country?: string;
  countryId?: string;
  countryIso?: string;
};

const columnHelper = createColumnHelper<Port>()

export function PortsTable({ 
  data, 
  countries, 
  regions,
  title = 'POL' 
}: { 
  data: Port[], 
  countries: any[], 
  regions: any[],
  title?: string 
}) {
  const router = useRouter()
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Port>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(`¿Eliminar este ${title}?`)) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/ports/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      router.refresh();
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (port: Port) => {
    setEditingRowId(port._id);
    setEditedData({ name: port.name, code: port.code, countryId: port.countryId });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/ports/${id}`, {
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

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: title,
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <input type="text" value={meta?.editedData.name} onChange={e => meta?.setEditedData({...meta?.editedData, name: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2" />
        ) : (
          <div className="font-medium text-gray-900">{getValue() || 'N/A'}</div>
        );
      },
    }),
    columnHelper.accessor('code', {
      header: `IATA ${title}`,
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <input type="text" value={meta?.editedData.code} onChange={e => meta?.setEditedData({...meta?.editedData, code: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2" />
        ) : (
          <span className="text-gray-500 font-bold uppercase">{getValue() || 'N/A'}</span>
        );
      },
    }),
    columnHelper.accessor('country', {
        header: `PAIS ${title}`,
        cell: ({ row, getValue, table }) => {
          const meta = table.options.meta as any;
          return meta?.editingRowId === row.original._id ? (
            <select value={meta?.editedData.countryId} onChange={e => meta?.setEditedData({...meta?.editedData, countryId: e.target.value})} className="w-full rounded border-gray-300 text-black text-sm py-1 px-2">
              <option value="">Seleccionar...</option>
              {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          ) : (
            getValue() || 'N/A'
          );
        },
      }),
    columnHelper.accessor('countryIso', {
        header: `NOMBRE DE PAIS ${title}(ISO3166)`,
        cell: ({ row, getValue }) => (
          <span className="text-gray-400 text-xs font-mono">{getValue() || 'N/A'}</span>
        ),
      }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right w-full block">Acciones</span>,
      cell: ({ row, table }) => {
        const meta = table.options.meta as any;
        return (
          <div className="text-right whitespace-nowrap">
            {meta?.editingRowId === row.original._id ? (
              <>
                <button onClick={() => meta?.handleSaveEdit(row.original._id)} className="p-1.5 text-green-600 hover:text-green-800"><CheckIcon className="h-5 w-5" /></button>
                <button onClick={() => meta?.setEditingRowId(null)} className="p-1.5 text-red-600 hover:text-red-800"><XMarkIcon className="h-5 w-5" /></button>
              </>
            ) : (
              <>
                <button onClick={() => meta?.handleEditClick(row.original)} className="p-1.5 text-gray-400 hover:text-indigo-600"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => meta?.handleDelete(row.original._id)} disabled={isDeleting === row.original._id} className="p-1.5 text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
              </>
            )}
          </div>
        );
      },
    })
  ], [countries, isDeleting, title])

  const table = useReactTable({ 
    data, 
    columns, 
    getCoreRowModel: getCoreRowModel(),
    meta: {
      editingRowId,
      editedData,
      setEditedData,
      handleSaveEdit,
      setEditingRowId,
      handleEditClick,
      handleDelete
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-3">
        <CreatePortFullModal countries={countries} regions={regions} title={title} />
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
