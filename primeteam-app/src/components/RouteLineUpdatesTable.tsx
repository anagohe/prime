'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { PlusIcon, CheckIcon, XMarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid'
import { formatDate } from '@/lib/utils'

type RouteLineUpdate = {
  _id: string;
  route?: string;
  routeId?: string;
  shippingLine?: string;
  shippingLineId?: string;
  lastUpdateDate?: string;
  manual_status?: 'ACTUALIZADO' | 'PENDIENTE';
};

type Ref = { _id: string; label?: string; name?: string; }

const columnHelper = createColumnHelper<RouteLineUpdate>()

// Helper para formatear la fecha para el input type="date"
const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
}

export function RouteLineUpdatesTable({ data, routes, shippingLines }: { data: RouteLineUpdate[], routes: Ref[], shippingLines: Ref[] }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ route: '', shippingLine: '', lastUpdateDate: '', manual_status: 'PENDIENTE' })
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Omit<RouteLineUpdate, 'route' | 'shippingLine'>> & { route?: string, shippingLine?: string }>({});
  const [error, setError] = useState<string | null>(null);

  // --- DELETE ---
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
    try {
      const response = await fetch(`/api/route-line-updates/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al eliminar');
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    }
  };

  // --- UPDATE ---
  const handleEditClick = (item: RouteLineUpdate) => {
    setEditingRowId(item._id);
    setEditedData({ 
        route: item.routeId,
        shippingLine: item.shippingLineId,
        lastUpdateDate: formatDateForInput(item.lastUpdateDate),
        manual_status: item.manual_status || 'PENDIENTE'
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editedData.route || !editedData.shippingLine || !editedData.lastUpdateDate) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/route-line-updates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData)
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al actualizar');
      setEditingRowId(null);
      setEditedData({});
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedData({});
    setError(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditedData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };
  
  // --- COLUMNS ---
  const columns = useMemo(() => [
    columnHelper.accessor('route', {
      header: 'Ruta',
      cell: ({ row, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <select name="route" value={meta?.editedData.route ?? ''} onChange={meta?.handleEditInputChange} className="w-full rounded border-gray-300 text-black text-xs font-bold">
              <option value="">Ruta...</option>
              {routes.map(r => <option key={r._id} value={r._id}>{r.label}</option>)}
          </select>
        ) : <div className="font-bold text-[#1e4079] uppercase text-xs">{row.original.route || 'No disponible'}</div>;
      },
    }),
    columnHelper.accessor('shippingLine', {
      header: 'Naviera',
      cell: ({ row, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <select name="shippingLine" value={meta?.editedData.shippingLine ?? ''} onChange={meta?.handleEditInputChange} className="w-full rounded border-gray-300 text-black text-xs font-bold">
              <option value="">Naviera...</option>
              {shippingLines.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        ) : <span className="font-black text-gray-700 text-xs">{row.original.shippingLine || 'No disponible'}</span>;
      },
    }),
    columnHelper.display({
      id: 'status',
      header: 'Estado',
      cell: ({ row, table }) => {
        const meta = table.options.meta as any;
        const currentStatus = row.original.manual_status || 'PENDIENTE';
        
        if (meta?.editingRowId === row.original._id) {
            return (
                <select name="manual_status" value={meta?.editedData.manual_status ?? 'PENDIENTE'} onChange={meta?.handleEditInputChange} className="w-full rounded border-gray-300 text-black text-[10px] font-bold">
                    <option value="ACTUALIZADO">ACTUALIZADO</option>
                    <option value="PENDIENTE">PENDIENTE</option>
                </select>
            );
        }

        return currentStatus === 'ACTUALIZADO' ? (
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
            ACTUALIZADO
          </span>
        ) : (
          <span className="inline-flex items-center gap-x-1.5 rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
            PENDIENTE
          </span>
        );
      }
    }),
    columnHelper.accessor('lastUpdateDate', {
        header: 'Última Actualización',
        cell: ({ row, getValue, table }) => {
            const meta = table.options.meta as any;
            return meta?.editingRowId === row.original._id ? (
                <input type="date" name="lastUpdateDate" value={meta?.editedData.lastUpdateDate ?? ''} onChange={meta?.handleEditInputChange} className="w-full rounded border-gray-300 text-black text-xs" />
            ) : (
                <span className="text-xs font-medium text-gray-500">{getValue() ? new Date(getValue() + 'T00:00:00').toLocaleDateString('es-MX') : '---'}</span>
            );
        },
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
                <button onClick={() => meta?.handleSaveEdit(row.original._id)} title="Guardar"><CheckIcon className="h-5 w-5 text-green-600" /></button>
                <button onClick={() => meta?.handleCancelEdit()} title="Cancelar"><XMarkIcon className="h-5 w-5 text-red-600" /></button>
              </>
            ) : (
              <>
                <button onClick={() => meta?.handleEditClick(row.original)} title="Editar"><PencilIcon className="h-5 w-5 text-gray-400 hover:text-indigo-600" /></button>
                <button onClick={() => meta?.handleDelete(row.original._id)} title="Eliminar"><TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-600" /></button>
              </>
            )}
          </div>
        );
      },
    })
  ], [routes, shippingLines]);

  const table = useReactTable({ 
    data, 
    columns, 
    getCoreRowModel: getCoreRowModel(),
    meta: {
      editingRowId,
      editedData,
      handleEditInputChange,
      handleSaveEdit,
      setEditingRowId,
      handleEditClick,
      handleDelete,
      handleCancelEdit
    }
  });
  
  // --- CREATE ---
  const handleSaveNew = async () => {
    if (!newData.route || !newData.shippingLine || !newData.lastUpdateDate) {
        setError('Todos los campos son obligatorios.');
      return;
    }
    setError(null);
    try {
      const response = await fetch('/api/route-line-updates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newData) });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al guardar');
      setIsCreating(false);
      setNewData({ route: '', shippingLine: '', lastUpdateDate: '', manual_status: 'PENDIENTE' });
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCancelNew = () => {
    setIsCreating(false);
    setNewData({ route: '', shippingLine: '', lastUpdateDate: '', manual_status: 'PENDIENTE' });
    setError(null);
  };

  const handleNewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Matriz de Control de Actualizaciones</h3>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1 rounded-md bg-indigo-600 px-2 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-colors">
            <PlusIcon className="h-4 w-4" /> Nuevo Registro
          </button>
        )}
      </div>
      {error && <div className="p-2 mb-4 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-md">{error}</div>}
      <div className="flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} scope="col" className="py-2 pl-4 pr-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest sm:pl-0">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isCreating && (
                  <tr className="bg-indigo-50/50">
                    <td className="p-2">
                        <select name="route" value={newData.route} onChange={handleNewInputChange} className="w-full rounded border-gray-300 text-black text-xs font-bold">
                            <option value="">Ruta...</option>
                            {routes.map(r => <option key={r._id} value={r._id}>{r.label}</option>)}
                        </select>
                    </td>
                    <td className="p-2">
                        <select name="shippingLine" value={newData.shippingLine} onChange={handleNewInputChange} className="w-full rounded border-gray-300 text-black text-xs font-bold">
                            <option value="">Naviera...</option>
                            {shippingLines.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </td>
                    <td className="p-2">
                        <select name="manual_status" value={newData.manual_status} onChange={handleNewInputChange} className="w-full rounded border-gray-300 text-black text-xs font-bold">
                            <option value="ACTUALIZADO">ACTUALIZADO</option>
                            <option value="PENDIENTE">PENDIENTE</option>
                        </select>
                    </td>
                    <td className="p-2">
                        <input type="date" name="lastUpdateDate" value={newData.lastUpdateDate} onChange={handleNewInputChange} className="w-full rounded border-gray-300 text-black text-xs"/>
                    </td>
                    <td className="p-2 text-right">
                       <div className="flex justify-end gap-1">
                        <button onClick={handleSaveNew} className="p-1 hover:bg-green-100 rounded text-green-600"><CheckIcon className="h-5 w-5" /></button>
                        <button onClick={handleCancelNew} className="p-1 hover:bg-rose-100 rounded text-rose-600"><XMarkIcon className="h-5 w-5" /></button>
                       </div>
                    </td>
                  </tr>
                )}
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-gray-700 sm:pl-0">
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
