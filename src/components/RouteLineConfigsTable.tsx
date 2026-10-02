'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

type Config = {
  _id: string;
  route?: string;
  shippingLine?: string;
  service?: string;
  terminal?: string;
};

const columnHelper = createColumnHelper<Config>()

export function RouteLineConfigsTable({ data }: { data: Config[] }) {
  const columns = useMemo(() => [
    columnHelper.accessor('route', {
      header: 'Route',
      cell: info => <div className="font-medium text-gray-900">{info.getValue() || 'N/A'}</div>,
    }),
    columnHelper.accessor('shippingLine', {
      header: 'Shipping Line',
      cell: info => info.getValue() || 'N/A',
    }),
    columnHelper.accessor('service', {
        header: 'Service',
        cell: info => info.getValue() || 'N/A',
    }),
    columnHelper.accessor('terminal', {
        header: 'Terminal',
        cell: info => info.getValue() || 'N/A',
    }),
  ], [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
  )
}
