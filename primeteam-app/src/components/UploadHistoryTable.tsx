'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { ExcelUploader } from './ExcelUploader'
import { formatDate } from '@/lib/utils'

type UploadEntry = {
  _id: string;
  file_name?: string;
  uploaded_at?: string;
  uploadedBy?: string;
  version_tag?: string;
};

const columnHelper = createColumnHelper<UploadEntry>()

export function UploadHistoryTable({ data }: { data: UploadEntry[] }) {
  const router = useRouter()
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este registro de carga?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/upload-history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      router.refresh();
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setIsDeleting(null);
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('file_name', {
      header: 'Archivo',
      cell: info => <div className="font-medium text-gray-900 max-w-[200px] truncate" title={info.getValue()}>{info.getValue() || 'No disponible'}</div>,
    }),
    columnHelper.accessor('uploaded_at', {
      header: 'Fecha',
      cell: info => <span className="text-gray-500">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor('version_tag', {
        header: 'v.',
        cell: info => (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">
                {info.getValue() || 'v1'}
            </span>
        ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right w-full block">Acciones</span>,
      cell: ({ row }) => (
        <div className="text-right whitespace-nowrap">
          <button
            onClick={() => handleDelete(row.original._id)}
            disabled={isDeleting === row.original._id}
            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ], [isDeleting])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setIsUploaderOpen(true)}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-all"
        >
          <PlusIcon className="-ml-0.5 h-4 w-4" />
          Nueva Carga
        </button>
      </div>

      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto">
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

      {isUploaderOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
            <button onClick={() => setIsUploaderOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Cargar Nuevo Excel de Itinerarios</h3>
            <ExcelUploader />
          </div>
        </div>
      )}
    </div>
  )
}
