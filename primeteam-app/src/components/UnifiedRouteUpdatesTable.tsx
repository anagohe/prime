'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef } from 'react'
import { PlusIcon, CheckIcon, XMarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid'
import { useNotification } from './Notification'

type UnifiedUpdate = {
  _id: string;
  responsible?: string;
  responsibleId?: string;
  update_day?: string;
  shippingLine?: string;
  shippingLineId?: string;
  route?: string;
  routeId?: string;
  lastUpdateDate?: string;
  manual_status?: string; // ACTUALIZADA / NO ACTUALIZADA
  status?: string;        // ACTIVA / INACTIVA
};

type Ref = { _id: string; label?: string; name?: string; fullName?: string; }

const columnHelper = createColumnHelper<UnifiedUpdate>()

const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
}

// Separate component for input to avoid focus loss
function EditableInput({ value, onChange, placeholder = "", type = "text" }: { value: string, onChange: (val: string) => void, placeholder?: string, type?: string }) {
    const [localValue, setLocalValue] = useState(value);
    
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <input 
            type={type}
            value={localValue ?? ''} 
            onChange={e => {
                setLocalValue(e.target.value);
                onChange(e.target.value);
            }} 
            className="w-full rounded border-gray-300 text-xs text-black font-bold bg-white" 
            placeholder={placeholder} 
        />
    );
}

function EditableSelect({ value, onChange, options, placeholder = "Seleccionar..." }: { value: string, onChange: (val: string) => void, options: {id: string, label: string}[], placeholder?: string }) {
    return (
        <select 
            value={value ?? ''} 
            onChange={e => onChange(e.target.value)} 
            className="w-full rounded border-gray-300 text-xs text-black font-bold bg-white"
        >
            <option value="">{placeholder}</option>
            {options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
    );
}

export function UnifiedRouteUpdatesTable({ data, routes, shippingLines, people }: { data: UnifiedUpdate[], routes: Ref[], shippingLines: Ref[], people: Ref[] }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isCreating, setIsCreating] = useState(false)
  const [newData, setNewData] = useState({ 
    route: '', 
    shippingLine: '', 
    lastUpdateDate: '', 
    manual_status: 'NO ACTUALIZADA', 
    status: 'ACTIVA',
    responsibleId: '',
    update_day: ''
  })
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<UnifiedUpdate>>({});

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      const response = await fetch(`/api/route-line-updates/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      showNotification('success', 'Registro eliminado', 'El registro se ha eliminado correctamente.');
      router.refresh();
    } catch (error: any) {
      showNotification('error', 'Error', error.message);
    }
  };

  const handleEditClick = (item: UnifiedUpdate) => {
    setEditedData({ 
        routeId: item.routeId,
        shippingLineId: item.shippingLineId,
        lastUpdateDate: formatDateForInput(item.lastUpdateDate),
        manual_status: item.manual_status || 'NO ACTUALIZADA',
        status: item.status || 'ACTIVA',
        responsibleId: item.responsibleId,
        update_day: item.update_day
    });
    setEditingRowId(item._id);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/route-line-updates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            route: editedData.routeId,
            shippingLine: editedData.shippingLineId,
            lastUpdateDate: editedData.lastUpdateDate,
            manual_status: editedData.manual_status,
            status: editedData.status,
            responsible: editedData.responsibleId,
            update_day: editedData.update_day
        })
      });
      if (!response.ok) throw new Error('Error al actualizar');
      setEditingRowId(null);
      showNotification('success', 'Actualizado', 'Registro actualizado correctamente.');
      router.refresh();
    } catch (error: any) {
      showNotification('error', 'Error', error.message);
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('responsible', {
      header: 'RESPONSABLE',
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <EditableSelect 
              value={meta?.editedData.responsibleId ?? ''} 
              onChange={val => meta?.setEditedData((prev: any) => ({...prev, responsibleId: val}))} 
              options={people.map(p => ({ id: p._id, label: p.fullName || '' }))}
              placeholder="Responsable..."
          />
        ) : <span className="font-medium text-gray-900">{getValue() || 'No asignado'}</span>;
      },
    }),
    columnHelper.accessor('update_day', {
      header: 'DIA DE ACTUALIZACIONES',
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <EditableInput 
              value={meta?.editedData.update_day ?? ''} 
              onChange={val => meta?.setEditedData((prev: any) => ({...prev, update_day: val}))} 
              placeholder="Ej: Lunes"
          />
        ) : <span className="font-black text-indigo-600 uppercase text-[10px]">{getValue() || '---'}</span>;
      },
    }),
    columnHelper.accessor('shippingLine', {
      header: 'NAVIERA',
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <EditableSelect 
              value={meta?.editedData.shippingLineId ?? ''} 
              onChange={val => meta?.setEditedData((prev: any) => ({...prev, shippingLineId: val}))} 
              options={shippingLines.map(s => ({ id: s._id, label: s.name || '' }))}
              placeholder="Naviera..."
          />
        ) : <span className="font-bold text-gray-900">{getValue()}</span>;
      },
    }),
    columnHelper.accessor('route', {
      header: 'RUTA',
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <EditableSelect 
              value={meta?.editedData.routeId ?? ''} 
              onChange={val => meta?.setEditedData((prev: any) => ({...prev, routeId: val}))} 
              options={routes.map(r => ({ id: r._id, label: r.label || '' }))}
              placeholder="Ruta..."
          />
        ) : <span className="text-[#1e4079] font-bold text-xs uppercase">{getValue()}</span>;
      },
    }),
    columnHelper.accessor('lastUpdateDate', {
      header: 'ULTIMA FECHA DE ACTUALIZACION',
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        return meta?.editingRowId === row.original._id ? (
          <EditableInput 
              type="date"
              value={meta?.editedData.lastUpdateDate ?? ''} 
              onChange={val => meta?.setEditedData((prev: any) => ({...prev, lastUpdateDate: val}))} 
          />
        ) : <span className="text-xs text-gray-600 font-mono">{getValue() ? new Date(getValue() + 'T00:00:00').toLocaleDateString('es-MX') : '---'}</span>;
      },
    }),
    columnHelper.accessor('manual_status', {
      header: 'ACTUALIZACION',
      cell: ({ row, getValue, table }) => {
        const meta = table.options.meta as any;
        const val = getValue() || 'NO ACTUALIZADA';
        if (meta?.editingRowId === row.original._id) {
            return (
                <EditableSelect 
                    value={meta?.editedData.manual_status ?? 'NO ACTUALIZADA'} 
                    onChange={val => meta?.setEditedData((prev: any) => ({...prev, manual_status: val}))} 
                    options={[
                        { id: 'ACTUALIZADA', label: 'ACTUALIZADA' },
                        { id: 'NO ACTUALIZADA', label: 'NO ACTUALIZADA' }
                    ]}
                />
            )
        }
        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-black ${val === 'ACTUALIZADA' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                {val}
            </span>
        )
      },
    }),
    columnHelper.accessor('status', {
        header: 'STATUS',
        cell: ({ row, getValue, table }) => {
          const meta = table.options.meta as any;
          const val = getValue() || 'ACTIVA';
          if (meta?.editingRowId === row.original._id) {
              return (
                <EditableSelect 
                    value={meta?.editedData.status ?? 'ACTIVA'} 
                    onChange={val => meta?.setEditedData((prev: any) => ({...prev, status: val}))} 
                    options={[
                        { id: 'ACTIVA', label: 'ACTIVA' },
                        { id: 'INACTIVA', label: 'INACTIVA' }
                    ]}
                />
              )
          }
          return (
              <span className={`px-2 py-1 rounded-full text-[10px] font-black ${val === 'ACTIVA' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {val}
              </span>
          )
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
                <button onClick={() => meta?.handleSaveEdit(row.original._id)} className="p-1 text-green-600"><CheckIcon className="h-5 w-5" /></button>
                <button onClick={() => meta?.setEditingRowId(null)} className="p-1 text-red-600"><XMarkIcon className="h-5 w-5" /></button>
              </>
            ) : (
              <>
                <button onClick={() => meta?.handleEditClick(row.original)} className="p-1 text-gray-400 hover:text-indigo-600"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => meta?.handleDelete(row.original._id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
              </>
            )}
          </div>
        );
      },
    })
  ], [routes, shippingLines, people]);

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

  const handleSaveNew = async () => {
    if (!newData.route || !newData.shippingLine || !newData.lastUpdateDate) {
        showNotification('error', 'Campos obligatorios', 'Todos los campos son obligatorios para crear el registro.');
        return;
    }
    try {
      const response = await fetch('/api/route-line-updates', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
            route: newData.route,
            shippingLine: newData.shippingLine,
            lastUpdateDate: newData.lastUpdateDate,
            manual_status: newData.manual_status,
            status: newData.status,
            responsible: newData.responsibleId,
            update_day: newData.update_day
        }) 
      });
      if (!response.ok) throw new Error('Error al crear');
      setIsCreating(false);
      setNewData({ route: '', shippingLine: '', lastUpdateDate: '', manual_status: 'NO ACTUALIZADA', status: 'ACTIVA', responsibleId: '', update_day: '' });
      showNotification('success', 'Creado', 'Registro creado correctamente.');
      router.refresh();
    } catch (error: any) {
      showNotification('error', 'Error', error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Matriz de Itinerarios y Actualizaciones</h3>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            <PlusIcon className="-ml-0.5 h-4 w-4" /> Nuevo Registro
          </button>
        )}
      </div>

      <div className="flow-root overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="py-3.5 pl-4 pr-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider sm:pl-0">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isCreating && (
                <tr className="bg-indigo-50/50">
                    <td className="p-2">
                        <EditableSelect 
                            value={newData.responsibleId} 
                            onChange={val => setNewData({...newData, responsibleId: val})} 
                            options={people.map(p => ({ id: p._id, label: p.fullName || '' }))}
                            placeholder="Responsable..."
                        />
                    </td>
                    <td className="p-2">
                        <EditableInput 
                            value={newData.update_day} 
                            onChange={val => setNewData({...newData, update_day: val})} 
                            placeholder="Ej: Lunes"
                        />
                    </td>
                    <td className="p-2">
                        <EditableSelect 
                            value={newData.shippingLine} 
                            onChange={val => setNewData({...newData, shippingLine: val})} 
                            options={shippingLines.map(s => ({ id: s._id, label: s.name || '' }))}
                            placeholder="Naviera..."
                        />
                    </td>
                    <td className="p-2">
                        <EditableSelect 
                            value={newData.route} 
                            onChange={val => setNewData({...newData, route: val})} 
                            options={routes.map(r => ({ id: r._id, label: r.label || '' }))}
                            placeholder="Ruta..."
                        />
                    </td>
                    <td className="p-2">
                        <EditableInput 
                            type="date"
                            value={newData.lastUpdateDate} 
                            onChange={val => setNewData({...newData, lastUpdateDate: val})} 
                        />
                    </td>
                    <td className="p-2">
                        <EditableSelect 
                            value={newData.manual_status} 
                            onChange={val => setNewData({...newData, manual_status: val})} 
                            options={[
                                { id: 'ACTUALIZADA', label: 'ACTUALIZADA' },
                                { id: 'NO ACTUALIZADA', label: 'NO ACTUALIZADA' }
                            ]}
                        />
                    </td>
                    <td className="p-2">
                        <EditableSelect 
                            value={newData.status} 
                            onChange={val => setNewData({...newData, status: val})} 
                            options={[
                                { id: 'ACTIVA', label: 'ACTIVA' },
                                { id: 'INACTIVA', label: 'INACTIVA' }
                            ]}
                        />
                    </td>
                    <td className="p-2 text-right">
                        <button onClick={handleSaveNew} className="p-1 text-green-600"><CheckIcon className="h-5 w-5" /></button>
                        <button onClick={() => setIsCreating(false)} className="p-1 text-red-600"><XMarkIcon className="h-5 w-5" /></button>
                    </td>
                </tr>
            )}
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
