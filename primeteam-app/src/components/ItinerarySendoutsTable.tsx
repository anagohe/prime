'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { PlusIcon, CheckIcon, XMarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { getWeekNumber } from '@/lib/utils'
import { useNotification } from './Notification'

type ItinerarySendout = {
  _id: string;
  location?: string;
  reviewed?: boolean;
  route?: string;
  routeId?: string;
  responsible?: string;
  responsibleId?: string;
  sent_date?: string;
  week_number?: number;
  status?: string;
  delivery_method?: string;
  business_name?: string;
  email?: string;
  shipping_line_name?: string;
  team_name?: string;
  preferred_carrier?: string;
  sales_executive?: string;
  free_days_origin?: number;
  periodicity?: string;
  observations?: string;
  is_updated?: boolean;
};

const columnHelper = createColumnHelper<ItinerarySendout>()

export function ItinerarySendoutsTable({ data, routes, people }: { data: ItinerarySendout[], routes: any[], people: any[] }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [isCreating, setIsCreating] = useState(false)
  const [currentWeek, setCurrentWeek] = useState('')

  useEffect(() => {
    setCurrentWeek(getWeekNumber())
  }, [])

  const [newData, setNewData] = useState({ 
    location: '',
    reviewed: false,
    routeId: '', 
    responsibleId: '', 
    sent_date: new Date().toISOString().split('T')[0], 
    week_number: '', 
    status: 'PENDIENTE', 
    delivery_method: 'CORREO',
    business_name: '',
    email: '',
    shipping_line_name: '',
    team_name: '',
    preferred_carrier: '',
    sales_executive: '',
    free_days_origin: '',
    periodicity: '',
    observations: '',
    is_updated: true
  })

  useEffect(() => {
    if (currentWeek) {
      const num = parseInt(currentWeek.replace('W', ''))
      setNewData(prev => ({ ...prev, week_number: num.toString() }))
    }
  }, [currentWeek])

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<ItinerarySendout>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este registro de envío?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/itinerary-sendouts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      showNotification('success', 'Registro eliminado', 'El registro de envío se ha eliminado.');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al eliminar el registro.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleReviewed = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/itinerary-sendouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: !currentStatus })
      });
      if (!res.ok) throw new Error('Error');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al actualizar revisión.');
    }
  };

  const handleEditClick = (item: ItinerarySendout) => {
    setEditingRowId(item._id);
    setEditedData({ 
        location: item.location,
        reviewed: item.reviewed,
        routeId: item.routeId, 
        responsibleId: item.responsibleId, 
        sent_date: item.sent_date, 
        week_number: item.week_number, 
        status: item.status, 
        delivery_method: item.delivery_method,
        business_name: item.business_name,
        email: item.email,
        shipping_line_name: item.shipping_line_name,
        team_name: item.team_name,
        preferred_carrier: item.preferred_carrier,
        sales_executive: item.sales_executive,
        free_days_origin: item.free_days_origin,
        periodicity: item.periodicity,
        observations: item.observations,
        is_updated: item.is_updated
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/itinerary-sendouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            location: editedData.location,
            reviewed: editedData.reviewed,
            route_id: editedData.routeId,
            responsible_id: editedData.responsibleId,
            sent_date: editedData.sent_date,
            week_number: editedData.week_number,
            status: editedData.status,
            delivery_method: editedData.delivery_method,
            business_name: editedData.business_name,
            email: editedData.email,
            shipping_line_name: editedData.shipping_line_name,
            team_name: editedData.team_name,
            preferred_carrier: editedData.preferred_carrier,
            sales_executive: editedData.sales_executive,
            free_days_origin: editedData.free_days_origin,
            periodicity: editedData.periodicity,
            observations: editedData.observations,
            is_updated_manual: editedData.is_updated
        })
      });
      if (!res.ok) throw new Error('Error');
      setEditingRowId(null);
      showNotification('success', 'Actualizado', 'Registro de envío actualizado correctamente.');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al actualizar el registro.');
    }
  };

  const handleSaveNew = async () => {
    if (!newData.routeId || !newData.sent_date || !newData.week_number || !newData.status) {
        showNotification('error', 'Campos obligatorios', 'Todos los campos obligatorios deben estar llenos');
        return;
    }
    try {
      const res = await fetch('/api/itinerary-sendouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            location: newData.location,
            reviewed: newData.reviewed,
            route_id: newData.routeId,
            responsible_id: newData.responsibleId,
            sent_date: newData.sent_date,
            week_number: newData.week_number,
            status: newData.status,
            delivery_method: newData.delivery_method,
            business_name: newData.business_name,
            email: newData.email,
            shipping_line_name: newData.shipping_line_name,
            team_name: newData.team_name,
            preferred_carrier: newData.preferred_carrier,
            sales_executive: newData.sales_executive,
            free_days_origin: newData.free_days_origin,
            periodicity: newData.periodicity,
            observations: newData.observations,
            is_updated_manual: newData.is_updated
        })
      });
      if (!res.ok) throw new Error('Error');
      setIsCreating(false);
      setNewData({ 
        location: '',
        reviewed: false,
        routeId: '', 
        responsibleId: '', 
        sent_date: new Date().toISOString().split('T')[0], 
        week_number: parseInt(currentWeek.replace('W','')).toString(), 
        status: 'PENDIENTE', 
        delivery_method: 'CORREO',
        business_name: '',
        email: '',
        shipping_line_name: '',
        team_name: '',
        preferred_carrier: '',
        sales_executive: '',
        free_days_origin: '',
        periodicity: '',
        observations: '',
        is_updated: true
      });
      showNotification('success', 'Registrado', 'Nuevo envío registrado correctamente.');
      router.refresh();
    } catch (err) {
      showNotification('error', 'Error', 'Error al crear el registro.');
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('location', {
        header: 'Lugar',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="text" value={editedData.location} onChange={e => setEditedData({...editedData, location: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-600 text-[10px] font-medium">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('week_number', {
        header: 'Semana',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
            <input type="number" value={editedData.week_number} onChange={e => setEditedData({...editedData, week_number: parseInt(e.target.value)})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-indigo-700 text-[10px] font-black italic">W{getValue()}</span>
        ),
    }),
    columnHelper.accessor('business_name', {
        header: 'Razón Social',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="text" value={editedData.business_name} onChange={e => setEditedData({...editedData, business_name: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-900 text-[10px] font-bold uppercase">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('email', {
        header: 'Correo de Envío',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="email" value={editedData.email} onChange={e => setEditedData({...editedData, email: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-500 text-[10px]">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('team_name', {
        header: 'Nombre de Equipo',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="text" value={editedData.team_name} onChange={e => setEditedData({...editedData, team_name: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-600 text-[10px]">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('preferred_carrier', {
        header: 'Preferred Carrier',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="text" value={editedData.preferred_carrier} onChange={e => setEditedData({...editedData, preferred_carrier: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-600 text-[10px] font-bold text-indigo-900">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('shipping_line_name', {
        header: 'Naviera de Envío',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="text" value={editedData.shipping_line_name} onChange={e => setEditedData({...editedData, shipping_line_name: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-600 text-[10px] font-bold uppercase">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('responsible', {
        header: 'Responsable',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <select value={editedData.responsibleId} onChange={e => setEditedData({...editedData, responsibleId: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white">
            <option value="">Responsable...</option>
            {people.map(p => <option key={p._id} value={p._id}>{p.fullName}</option>)}
          </select>
        ) : (
          <span className="text-gray-600 text-[10px] font-bold uppercase">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('route', {
      header: 'Ruta',
      cell: ({ row, getValue }) => editingRowId === row.original._id ? (
        <select value={editedData.routeId} onChange={e => setEditedData({...editedData, routeId: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white">
          <option value="">Ruta...</option>
          {routes.map(r => <option key={r._id} value={r._id}>{r.label}</option>)}
        </select>
      ) : (
        <div className="font-bold text-[#1e4079] uppercase tracking-tighter text-[10px]">{getValue() || 'N/A'}</div>
      ),
    }),
    columnHelper.accessor('free_days_origin', {
        header: 'Días Libres Origen',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="number" value={editedData.free_days_origin} onChange={e => setEditedData({...editedData, free_days_origin: parseInt(e.target.value)})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-500 text-[10px] font-bold">{getValue() || '0'}</span>
        ),
    }),
    columnHelper.accessor('sales_executive', {
        header: 'Ejecutivo de Ventas',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="text" value={editedData.sales_executive} onChange={e => setEditedData({...editedData, sales_executive: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-500 text-[10px] font-bold text-gray-700">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('periodicity', {
        header: 'Periocidad',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="text" value={editedData.periodicity} onChange={e => setEditedData({...editedData, periodicity: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-500 text-[10px]">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('sent_date', {
        header: 'Último Envío',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <input type="date" value={editedData.sent_date} onChange={e => setEditedData({...editedData, sent_date: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
        ) : (
          <span className="text-gray-500 text-[10px] font-bold">{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('is_updated', {
        header: 'Estatus Act.',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
            <input type="checkbox" checked={editedData.is_updated} onChange={e => setEditedData({...editedData, is_updated: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
        ) : (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
            getValue() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {getValue() ? 'ACTUALIZADO' : 'PENDIENTE'}
          </span>
        ),
    }),
    columnHelper.accessor('status', {
        header: 'Estatus Envío',
        cell: ({ row, getValue }) => editingRowId === row.original._id ? (
          <select value={editedData.status} onChange={e => setEditedData({...editedData, status: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white">
            <option value="ENVIADO">ENVIADO</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="RETRASADO">RETRASADO</option>
          </select>
        ) : (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
            getValue() === 'ENVIADO' ? 'bg-indigo-100 text-indigo-700' : 
            getValue() === 'RETRASADO' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}>{getValue() || 'N/A'}</span>
        ),
    }),
    columnHelper.accessor('reviewed', {
        header: 'Revisado',
        cell: ({ row, getValue }) => (
          <div className="flex justify-center">
            <input 
              type="checkbox" 
              checked={!!getValue()} 
              onChange={() => handleToggleReviewed(row.original._id, !!getValue())}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
          </div>
        )
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right w-full block">Acciones</span>,
      cell: ({ row }) => (
        <div className="text-right whitespace-nowrap">
          {editingRowId === row.original._id ? (
            <>
              <button onClick={() => handleSaveEdit(row.original._id)} className="p-1 text-green-600 hover:text-green-800"><CheckIcon className="h-4 w-4" /></button>
              <button onClick={() => setEditingRowId(null)} className="p-1 text-red-600 hover:text-red-800"><XMarkIcon className="h-4 w-4" /></button>
            </>
          ) : (
            <>
              <button onClick={() => handleEditClick(row.original)} className="p-1 text-gray-400 hover:text-indigo-600"><PencilIcon className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(row.original._id)} disabled={isDeleting === row.original._id} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
            </>
          )}
        </div>
      ),
    })
  ], [editingRowId, editedData, routes, people, isDeleting])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs font-black text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
           Semana Actual: <span className="text-sm">{currentWeek}</span>
        </div>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">
            <PlusIcon className="-ml-0.5 h-3 w-3" /> Registrar Envío
          </button>
        )}
      </div>
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(header => (
                      <th key={header.id} className="py-2 pl-4 pr-3 text-left text-[10px] font-bold text-gray-900 sm:pl-0 uppercase tracking-wider">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isCreating && (
                  <tr className="bg-indigo-50/50">
                    <td className="p-1">
                        <input type="text" placeholder="Lugar" value={newData.location} onChange={e => setNewData({...newData, location: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="number" placeholder="Semana" value={newData.week_number} onChange={e => setNewData({...newData, week_number: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="text" placeholder="Razón Social" value={newData.business_name} onChange={e => setNewData({...newData, business_name: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="email" placeholder="Correo" value={newData.email} onChange={e => setNewData({...newData, email: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="text" placeholder="Equipo" value={newData.team_name} onChange={e => setNewData({...newData, team_name: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="text" placeholder="Carrier" value={newData.preferred_carrier} onChange={e => setNewData({...newData, preferred_carrier: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="text" placeholder="Naviera" value={newData.shipping_line_name} onChange={e => setNewData({...newData, shipping_line_name: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <select value={newData.responsibleId} onChange={e => setNewData({...newData, responsibleId: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white">
                            <option value="">Responsable...</option>
                            {people.map(p => <option key={p._id} value={p._id}>{p.fullName}</option>)}
                        </select>
                    </td>
                    <td className="p-1">
                        <select value={newData.routeId} onChange={e => setNewData({...newData, routeId: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white">
                            <option value="">Ruta...</option>
                            {routes.map(r => <option key={r._id} value={r._id}>{r.label}</option>)}
                        </select>
                    </td>
                    <td className="p-1">
                        <input type="number" placeholder="Días Libres" value={newData.free_days_origin} onChange={e => setNewData({...newData, free_days_origin: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="text" placeholder="Ejecutivo" value={newData.sales_executive} onChange={e => setNewData({...newData, sales_executive: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="text" placeholder="Perioc." value={newData.periodicity} onChange={e => setNewData({...newData, periodicity: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="date" value={newData.sent_date} onChange={e => setNewData({...newData, sent_date: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white" />
                    </td>
                    <td className="p-1">
                        <input type="checkbox" checked={newData.is_updated} onChange={e => setNewData({...newData, is_updated: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                        <span className="text-[9px] ml-1">¿Act.?</span>
                    </td>
                    <td className="p-1">
                        <select value={newData.status} onChange={e => setNewData({...newData, status: e.target.value})} className="w-full rounded border-gray-300 text-black text-[10px] py-1 px-2 font-bold bg-white">
                            <option value="ENVIADO">ENVIADO</option>
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="RETRASADO">RETRASADO</option>
                        </select>
                    </td>
                    <td className="p-1 text-center">
                        <input type="checkbox" checked={newData.reviewed} onChange={e => setNewData({...newData, reviewed: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                    </td>
                    <td className="p-1 text-right">
                       <button onClick={handleSaveNew} className="p-1 text-green-600 hover:text-green-800"><CheckIcon className="h-4 w-4" /></button>
                       <button onClick={() => setIsCreating(false)} className="p-1 text-red-600 hover:text-red-800"><XMarkIcon className="h-4 w-4" /></button>
                    </td>
                  </tr>
                )}
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="whitespace-nowrap py-2 pl-4 pr-3 text-[10px] text-gray-900 sm:pl-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
