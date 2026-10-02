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
import { useNotification } from './Notification'
import { formatDate } from '@/lib/utils'

type LineUpdate = {
    _id: string;
    shippingLine: string;
    lastUpdateDate: string;
    manual_status?: string;
}

type RouteDirectory = {
  _id: string;
  route?: string;
  routeId?: string;
  responsible?: string;
  responsibleId?: string;
  periodicity?: string;
  update_day?: string;
  lineUpdates?: LineUpdate[];
};

type Ref = { _id: string; label?: string; fullName?: string; }

const columnHelper = createColumnHelper<RouteDirectory>()
const periodicityOptions = ['Semanal', 'Quincenal', 'Mensual'];

export function RouteDirectoriesTable({ data, routes, people }: { data: RouteDirectory[], routes: Ref[], people: Ref[] }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ route: '', responsible: '', periodicity: '', update_day: '' })
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<RouteDirectory>>({});

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este directorio?')) return;
    try {
      const response = await fetch(`/api/route-directories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al eliminar');
      showNotification('success', 'Directorio eliminado', 'El registro se ha eliminado correctamente.');
      router.refresh();
    } catch (error: any) {
      showNotification('error', 'Error', error.message);
    }
  };

  const handleEditClick = (item: RouteDirectory) => {
    setEditingRowId(item._id);
    setEditedData({ 
        routeId: item.routeId,
        responsibleId: item.responsibleId,
        periodicity: item.periodicity,
        update_day: item.update_day
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editedData.routeId || !editedData.responsibleId) {
      showNotification('error', 'Campos obligatorios', 'La ruta y el responsable son obligatorios.');
      return;
    }
    try {
      const response = await fetch(`/api/route-directories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            route: editedData.routeId,
            responsible: editedData.responsibleId,
            periodicity: editedData.periodicity,
            update_day: editedData.update_day
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar');
      }
      setEditingRowId(null);
      setEditedData({});
      showNotification('success', 'Actualizado', 'Directorio actualizado correctamente.');
      router.refresh();
    } catch (error: any) {
      showNotification('error', 'Error', error.message);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditedData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const columns = useMemo(() => [
    columnHelper.accessor('route', {
      header: 'Ruta',
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <select name="routeId" value={meta?.editedData.routeId ?? ''} onChange={meta?.handleEditInputChange} className="w-full rounded border-gray-300 text-black text-xs font-bold bg-white">
              <option value="">Selecciona Ruta...</option>
              {routes.map(r => <option key={r._id} value={r._id}>{r.label}</option>)}
          </select>
        ) : <div className="font-bold text-[#1e4079] uppercase">{getValue() || 'No disponible'}</div>;
      },
    }),
    columnHelper.accessor('responsible', {
      header: 'Responsable',
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <select name="responsibleId" value={meta?.editedData.responsibleId ?? ''} onChange={meta?.handleEditInputChange} className="w-full rounded border-gray-300 text-black text-xs font-bold bg-white">
              <option value="">Selecciona Responsable...</option>
              {people.map(p => <option key={p._id} value={p._id}>{p.fullName}</option>)}
          </select>
        ) : <span className="font-medium text-gray-900">{getValue() || 'No disponible'}</span>;
      },
    }),
    columnHelper.accessor('update_day', {
        header: 'Día de Actualización',
        cell: ({ row, getValue, table }) => {
          const meta = table.options.meta as any;
          return meta?.editingRowId === row.original._id ? (
            <input name="update_day" type="text" value={meta?.editedData.update_day ?? ''} onChange={meta?.handleEditInputChange} placeholder="Ej: Lunes" className="w-full rounded border-gray-300 text-black text-xs font-bold bg-white" />
          ) : <span className="font-black text-indigo-600 uppercase text-xs">{getValue() || 'No definido'}</span>;
        },
    }),
    columnHelper.display({
        id: 'updates',
        header: 'Actualizaciones por Línea',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.lineUpdates && row.original.lineUpdates.length > 0 ? (
                    row.original.lineUpdates.map(upd => (
                        <div key={upd._id} className={`border px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${upd.manual_status === 'ACTUALIZADO' ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-rose-50 border-rose-200 text-rose-700 font-bold'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${upd.manual_status === 'ACTUALIZADO' ? 'bg-green-600' : 'bg-rose-600'}`}></span>
                            <span className="opacity-70">{upd.shippingLine}:</span> {upd.lastUpdateDate}
                        </div>
                    ))
                ) : <span className="text-[10px] italic text-gray-400">Sin actualizaciones registradas</span>}
            </div>
        )
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
                <button onClick={() => meta?.setEditingRowId(null)} title="Cancelar"><XMarkIcon className="h-5 w-5 text-red-600" /></button>
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
  ], [routes, people]);

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
      handleDelete
    }
  });
  
  const handleSaveNew = async () => {
    if (!newData.route || !newData.responsible) {
      showNotification('error', 'Campos obligatorios', 'La ruta y el responsable son obligatorios.');
      return;
    }
    try {
      const response = await fetch('/api/route-directories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newData) });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al guardar');
      setIsCreating(false);
      setNewData({ route: '', responsible: '', periodicity: '', update_day: '' });
      showNotification('success', 'Guardado', 'Directorio creado correctamente.');
      router.refresh();
    } catch (error: any) {
      showNotification('error', 'Error', error.message);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Directorio de Itinerarios</h3>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            <PlusIcon className="-ml-0.5 h-5 w-5" />Añadir Directorio
          </button>
        )}
      </div>
      
      <div className="flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => <th key={header.id} scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-black text-gray-500 uppercase sm:pl-0">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isCreating && (
                  <tr className="bg-indigo-50/50">
                    <td className="p-2">
                        <select name="route" value={newData.route} onChange={e => setNewData({...newData, route: e.target.value})} className="w-full rounded border-gray-300 text-black text-xs font-bold bg-white">
                           <option value="">Selecciona Ruta...</option>
                           {routes.map(r => <option key={r._id} value={r._id}>{r.label}</option>)}
                       </select>
                    </td>
                    <td className="p-2">
                        <select name="responsible" value={newData.responsible} onChange={e => setNewData({...newData, responsible: e.target.value})} className="w-full rounded border-gray-300 text-black text-xs font-bold bg-white">
                           <option value="">Selecciona Responsable...</option>
                           {people.map(p => <option key={p._id} value={p._id}>{p.fullName}</option>)}
                       </select>
                    </td>
                    <td className="p-2">
                        <input name="update_day" type="text" placeholder="Día de Actualización" value={newData.update_day} onChange={e => setNewData({...newData, update_day: e.target.value})} className="w-full rounded border-gray-300 text-black text-xs font-bold bg-white" />
                    </td>
                    <td className="p-2 text-xs italic text-gray-400">Las actualizaciones se vinculan por ruta...</td>
                    <td className="p-2 text-right">
                       <button onClick={handleSaveNew}><CheckIcon className="h-5 w-5 text-green-600" /></button>
                       <button onClick={() => setIsCreating(false)}><XMarkIcon className="h-5 w-5 text-red-600" /></button>
                    </td>
                  </tr>
                )}
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => <td key={cell.id} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-700 sm:pl-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
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
