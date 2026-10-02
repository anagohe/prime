'use client'

import { useState, Fragment, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, Transition, Combobox } from '@headlessui/react'
import { ChevronUpDownIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { calculateClosingDocs, calculateCustomsClosing } from '@/lib/utils'
import { useNotification } from './Notification'

// --- TYPES ---
type RefProp = { _id: string; name?: string; label?: string; voyageCode?: string }
type VoyageProp = { _id: string; voyageCode: string; vessel?: string; vesselId?: string }

type ItineraryToEdit = {
  _id: string
  shippingLineId?: string
  routeId?: string
  serviceId?: string
  voyageId?: string
  vesselId?: string
  terminalId?: string
  etd?: string
  eta?: string
  final_etd?: string
  final_eta?: string
  final_transit_time_days?: number
  final_doc_closing?: string
  final_customs_closing?: string
  cargo_acceptance?: string
  fcl_lcl?: string
  tsPortId?: string
  remarks?: string
}

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  itineraryToEdit?: ItineraryToEdit | null
  shippingLines: RefProp[]
  routes: RefProp[]
  vessels: RefProp[]
  terminals: RefProp[]
  services: RefProp[]
  voyages: VoyageProp[]
  ports: RefProp[]
}

const initialFormData = {
  shipping_line_id: '',
  pol_id: '',
  pod_id: '',
  route_id: '',
  service_id: '',
  voyage_id: '',
  vessel_id: '',
  terminal_id: '',
  etd: '',
  eta: '',
  final_etd: '',
  final_eta: '',
  final_transit_time_days: '',
  final_doc_closing: '',
  final_customs_closing: '',
  cargo_acceptance: '',
  fcl_lcl: '',
  ts_port_id: '',
  remarks: '',
}

const normalizeCargoAcceptance = (value?: string) => {
  if (value === 'SI') return 'ACEPTA'
  if (value === 'NO') return 'NO ACEPTA'
  return value || ''
}

export function CreateItineraryModal({
  isOpen,
  onClose,
  itineraryToEdit,
  shippingLines = [],
  routes = [],
  vessels = [],
  terminals = [],
  services = [],
  voyages = [],
  ports = [],
  routeLineConfigs = [],
}: ModalProps & { routeLineConfigs: any[] }) {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState(initialFormData)
  const [voyageQuery, setVoyageQuery] = useState('')
  const [vesselQuery, setVesselQuery] = useState('')
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageProp | null>(null)
  const [selectedVessel, setSelectedVessel] = useState<RefProp | null>(null)
  const [selectedConfigId, setSelectedConfigId] = useState('')

  // Estados para creación manual
  const [showVesselForm, setShowVesselForm] = useState(false)
  const [showVoyageForm, setShowVoyageForm] = useState(false)
  const [newVesselData, setNewVesselData] = useState({ name: '', imo: '' })
  const [newVoyageData, setNewVoyageData] = useState({ voyageCode: '', vesselId: '' })
  const [isSavingEntity, setIsSavingEntity] = useState(false)

  // Filtrar puertos por tipo o por convención (México = POL, Otros = POD)
  const pols = useMemo(
    () =>
      ports.filter(
        (p: any) =>
          p.type === 'POL' ||
          p.type === 'BOTH' ||
          p.country === 'Mexico' ||
          p.country === 'México'
      ),
    [ports]
  )
  const pods = useMemo(
    () =>
      ports.filter(
        (p: any) =>
          p.type === 'POD' ||
          p.type === 'BOTH' ||
          (p.country !== 'Mexico' && p.country !== 'México')
      ),
    [ports]
  )

  const isEditing = !!itineraryToEdit

  // Al elegir una ruta maestra, auto-completar POL y POD
  const handleRouteSelection = (id: string) => {
    const route = routes.find((r) => r._id === id) as any
    if (route) {
      setFormData((prev) => ({
        ...prev,
        route_id: id,
        pol_id: route.originPortId || '',
        pod_id: route.destinationPortId || '',
      }))
      setError(null)
    } else {
      setFormData((prev) => ({ ...prev, route_id: '' }))
    }
  }

  // Sincronizar con itineraryToEdit SOLO cuando cambia el objeto o cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return

    if (itineraryToEdit) {
      const matchedRoute = routes.find((r) => r._id === itineraryToEdit.routeId) as any
      const voyage = (voyages || []).find((v) => v?._id === itineraryToEdit.voyageId)
      const resolvedVesselId = itineraryToEdit.vesselId || voyage?.vesselId || ''
      const vessel = (vessels || []).find((v) => v?._id === resolvedVesselId)

      setFormData({
        ...initialFormData,
        shipping_line_id: itineraryToEdit.shippingLineId || '',
        route_id: itineraryToEdit.routeId || '',
        pol_id: matchedRoute?.originPortId || '',
        pod_id: matchedRoute?.destinationPortId || '',
        service_id: itineraryToEdit.serviceId || '',
        voyage_id: itineraryToEdit.voyageId || '',
        vessel_id: resolvedVesselId,
        terminal_id: itineraryToEdit.terminalId || '',
        etd: itineraryToEdit.etd ? new Date(itineraryToEdit.etd).toISOString().split('T')[0] : '',
        eta: itineraryToEdit.eta ? new Date(itineraryToEdit.eta).toISOString().split('T')[0] : '',
        final_etd: itineraryToEdit.final_etd || '',
        final_eta: itineraryToEdit.final_eta || '',
        final_transit_time_days: itineraryToEdit.final_transit_time_days?.toString() || '',
        final_doc_closing: itineraryToEdit.final_doc_closing || '',
        final_customs_closing: itineraryToEdit.final_customs_closing || '',
        cargo_acceptance: normalizeCargoAcceptance(itineraryToEdit.cargo_acceptance),
        fcl_lcl: itineraryToEdit.fcl_lcl || '',
        ts_port_id: itineraryToEdit.tsPortId || '',
        remarks: itineraryToEdit.remarks || '',
      })

      setSelectedVoyage(voyage || null)
      setSelectedVessel(vessel || null)
    } else {
      // Si estamos creando uno nuevo y se abre el modal, resetear.
      // Pero NO resetear si el modal ya estaba abierto y solo cambiaron los props (vessels, voyages)
      setFormData((prev) => {
        // Si ya hay datos (por ejemplo, pol_id), no resetear.
        // Esto asume que si pol_id está vacío, es un reset inicial.
        if (prev.pol_id && !itineraryToEdit) return prev
        return initialFormData
      })
      if (!selectedVessel) {
        setSelectedVoyage(null)
        setSelectedVessel(null)
        setVoyageQuery('')
        setVesselQuery('')
      }
      setShowVesselForm(false)
      setShowVoyageForm(false)
    }
  }, [itineraryToEdit, isOpen]) // Eliminamos voyages, vessels, routes para evitar reset inesperado

  // Logic to find route automatically
  useEffect(() => {
    if (formData.pol_id && formData.pod_id) {
      const matchedRoute = routes.find(
        (r) =>
          (r as any).originPortId === formData.pol_id &&
          (r as any).destinationPortId === formData.pod_id
      )
      if (matchedRoute) {
        setFormData((prev) => ({ ...prev, route_id: matchedRoute._id }))
        setError(null)
      } else {
        setFormData((prev) => ({ ...prev, route_id: '' }))
        setError('No existe una ruta maestra para este par POL-POD. Por favor créala en Directorios.')
      }
    }
  }, [formData.pol_id, formData.pod_id, routes])

  // Sincronización de ETD/ETA con Final ETD/ETA solo en creación
  useEffect(() => {
    if (!isEditing && isOpen) {
      setFormData((prev) => ({
        ...prev,
        final_etd: prev.etd,
        final_eta: prev.eta,
      }))
    }
  }, [formData.etd, formData.eta, isEditing, isOpen])

  useEffect(() => {
    if (formData.final_etd) {
      const etdDate = new Date(formData.final_etd + 'T12:00:00') // Usar mediodía para evitar problemas de zona horaria
      if (!isNaN(etdDate.getTime())) {
        const docClosingDate = calculateClosingDocs(etdDate)
        const customsClosingDate = calculateCustomsClosing(etdDate)

        const docClosingStr = docClosingDate.toISOString().split('T')[0]
        const customsClosingStr = customsClosingDate.toISOString().split('T')[0]

        const updates: any = {}
        if (formData.final_doc_closing !== docClosingStr) {
          updates.final_doc_closing = docClosingStr
        }
        if (formData.final_customs_closing !== customsClosingStr) {
          updates.final_customs_closing = customsClosingStr
        }

        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({ ...prev, ...updates }))
        }
      }
    }
  }, [formData.final_etd])

  const filteredVoyages = useMemo(() => {
    const list = voyages || []
    return voyageQuery === ''
      ? list
      : list.filter((v) => v?.voyageCode?.toLowerCase().includes(voyageQuery.toLowerCase()))
  }, [voyages, voyageQuery])

  const filteredVessels = useMemo(() => {
    const list = vessels || []
    return vesselQuery === ''
      ? list
      : list.filter((v) => v?.name?.toLowerCase().includes(vesselQuery.toLowerCase()))
  }, [vessels, vesselQuery])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVoyageSelection = (voyage: VoyageProp | null) => {
    setSelectedVoyage(voyage)

    if (voyage) {
      const linkedVessel = voyage.vesselId
        ? (vessels || []).find((v) => v?._id === voyage.vesselId) || null
        : null

      if (linkedVessel) {
        setSelectedVessel(linkedVessel)
        setNewVoyageData((prev) => ({ ...prev, vesselId: linkedVessel._id }))
      }

      setFormData((prev) => ({
        ...prev,
        voyage_id: voyage._id,
        vessel_id: voyage.vesselId || prev.vessel_id,
      }))
      setVoyageQuery('')
    } else {
      setFormData((prev) => ({
        ...prev,
        voyage_id: '',
      }))
    }
  }

  const handleVesselSelection = (vessel: RefProp | null) => {
    setSelectedVessel(vessel)
    setSelectedVoyage(null)

    setFormData((prev) => ({
      ...prev,
      vessel_id: vessel?._id || '',
      voyage_id: '',
    }))

    setVesselQuery('')
    setVoyageQuery('')
    setNewVoyageData((prev) => ({ ...prev, vesselId: vessel?._id || '' }))
  }

  // Crear Buque Manualmente
  const handleCreateVessel = async () => {
    if (!newVesselData.name) {
      showNotification('error', 'Campo requerido', 'El nombre del buque es obligatorio.')
      return
    }
    setIsSavingEntity(true)
    try {
      const res = await fetch('/api/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVesselData),
      })
      if (!res.ok) throw new Error('Error al crear buque')
      showNotification('success', 'Buque creado', 'Buque creado con éxito. Ahora puedes seleccionarlo.')
      setShowVesselForm(false)
      setNewVesselData({ name: '', imo: '' })
      router.refresh()
    } catch (err) {
      showNotification('error', 'Error', 'Error al crear el buque')
    } finally {
      setIsSavingEntity(false)
    }
  }

  // Crear Viaje Manualmente
  const handleCreateVoyage = async () => {
    if (!newVoyageData.voyageCode || !newVoyageData.vesselId) {
      showNotification(
        'error',
        'Campos obligatorios',
        'El código de viaje y el buque son obligatorios.'
      )
      return
    }
    setIsSavingEntity(true)
    try {
      const res = await fetch('/api/voyages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVoyageData),
      })
      if (!res.ok) throw new Error('Error al crear viaje')
      showNotification('success', 'Viaje creado', 'Viaje creado con éxito. Ahora puedes seleccionarlo.')
      setShowVoyageForm(false)
      setNewVoyageData({ voyageCode: '', vesselId: '' })
      router.refresh()
    } catch (err) {
      showNotification('error', 'Error', 'Error al crear el viaje')
    } finally {
      setIsSavingEntity(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.route_id) {
      showNotification(
        'error',
        'Ruta no válida',
        'Debes seleccionar un POL y POD que tengan una ruta válida.'
      )
      return
    }
    setError(null)
    try {
      const url = isEditing ? `/api/itineraries/${itineraryToEdit?._id}` : '/api/itineraries'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al guardar')
      }

      showNotification(
        'success',
        isEditing ? 'Actualizado' : 'Creado',
        `Itinerario ${isEditing ? 'actualizado' : 'creado'} correctamente.`
      )
      onClose()
      router.refresh()
    } catch (err: any) {
      showNotification('error', 'Error', err.message)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[9999]"
        onClose={onClose}
        style={{ colorScheme: 'light' }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .force-light { color-scheme: light !important; }
            .force-light input, 
            .force-light select, 
            .force-light textarea,
            .force-light option,
            .force-light div,
            .force-light span,
            .force-light button { 
                color: black !important; 
                background-color: white !important; 
            }
            .force-light .bg-gray-50, .force-light .bg-indigo-50 { 
                background-color: #f9fafb !important; 
            }
            /* Estilos específicos para las listas de Combobox */
            [id^="headlessui-combobox-options"] {
                background-color: white !important;
                color: black !important;
                border: 1px solid #e5e7eb !important;
            }
            [id^="headlessui-combobox-option"]:hover {
                background-color: #4f46e5 !important;
                color: white !important;
            }
          `,
          }}
        />
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all text-black force-light">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-black border-b border-gray-200 pb-2 mb-4"
                >
                  {isEditing ? 'Editar Itinerario' : 'Crear Nuevo Itinerario'}
                </Dialog.Title>
                <form
                  onSubmit={handleSubmit}
                  className="mt-4 space-y-4 bg-white text-black"
                  style={{ colorScheme: 'light' }}
                >
                  {/* --- SECCIÓN DE RUTA MAESTRA (Selector Principal) --- */}
                  {!isEditing && (
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-bold text-black">Ruta Maestra *</label>
                        <select
                          value={formData.route_id}
                          onChange={(e) => handleRouteSelection(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm font-bold bg-white text-black focus:ring-indigo-500 focus:border-indigo-500"
                          style={{ color: 'black !important', backgroundColor: 'white !important' }}
                        >
                          <option value="" style={{ color: 'black', backgroundColor: 'white' }}>
                            --- Seleccionar Ruta (Origen → Destino) ---
                          </option>
                          {routes.map((r: any) => (
                            <option
                              key={r._id}
                              value={r._id}
                              style={{ color: 'black', backgroundColor: 'white' }}
                            >
                              {r.label || `${r.pol || 'POL'} → ${r.pod || 'POD'}`}
                            </option>
                          ))}
                        </select>

                        <p className="text-[10px] text-gray-500 mt-1 font-medium">
                          * Selecciona una ruta para auto-completar POL y POD.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black">POL *</label>
                      <select
                        name="pol_id"
                        value={formData.pol_id}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm font-bold bg-white focus:ring-indigo-500"
                      >
                        <option value="" className="bg-white text-black">
                          Seleccionar...
                        </option>
                        {(pols || []).map(
                          (item) =>
                            item?._id && (
                              <option key={item._id} value={item._id} className="bg-white text-black">
                                {item.name}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black">Puerto de Transbordo</label>
                      <select
                        name="ts_port_id"
                        value={formData.ts_port_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm font-bold bg-white focus:ring-indigo-500"
                      >
                        <option value="" className="bg-white text-black">
                          Seleccionar...
                        </option>
                        {(ports || []).map(
                          (item) =>
                            item?._id && (
                              <option key={item._id} value={item._id} className="bg-white text-black">
                                {item.name}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black">POD *</label>
                      <select
                        name="pod_id"
                        value={formData.pod_id}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm font-bold bg-white focus:ring-indigo-500"
                      >
                        <option value="" className="bg-white text-black">
                          Seleccionar...
                        </option>
                        {(pods || []).map(
                          (item) =>
                            item?._id && (
                              <option key={item._id} value={item._id} className="bg-white text-black">
                                {item.name}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black">Línea Naviera *</label>
                      <select
                        name="shipping_line_id"
                        value={formData.shipping_line_id}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm font-bold bg-white focus:ring-indigo-500"
                      >
                        <option value="" className="bg-white text-black">
                          Seleccionar...
                        </option>
                        {(shippingLines || []).map(
                          (item) =>
                            item?._id && (
                              <option key={item._id} value={item._id} className="bg-white text-black">
                                {item.name}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* --- SECCIÓN DE BUQUES Y VIAJES --- */}
                  <div className="border p-4 rounded-xl bg-gray-50 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-900 mb-2 font-bold">
                      <InformationCircleIcon className="h-5 w-5 text-indigo-600" />
                      <p className="text-xs font-bold uppercase tracking-tight text-indigo-900">
                        Para crear un viaje, primero debes seleccionar o crear un buque.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* BUSCADOR DE BUQUE */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-bold text-black">Buque (Vessel) *</label>
                          <button
                            type="button"
                            onClick={() => setShowVesselForm(!showVesselForm)}
                            className="text-[10px] font-black text-indigo-600 hover:underline"
                          >
                            {showVesselForm ? 'Cancelar' : '+ Crear Nuevo Buque'}
                          </button>
                        </div>

                        {!showVesselForm ? (
                          <Combobox value={selectedVessel} onChange={handleVesselSelection}>
                            <div className="relative">
                              <Combobox.Input
                                className="w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm pr-10 font-bold bg-white focus:ring-indigo-500"
                                onChange={(e) => setVesselQuery(e.target.value)}
                                displayValue={(v: any) => v?.name || ''}
                                placeholder="Buscar buque..."
                              />
                              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                              </Combobox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition duration-100 ease-in"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {filteredVessels.map((v) => (
                                    <Combobox.Option
                                      key={v._id}
                                      value={v}
                                      className={({ active }) =>
                                        `cursor-default select-none py-2 pl-10 pr-4 ${
                                          active ? 'bg-indigo-600 text-white' : 'text-black bg-white'
                                        }`
                                      }
                                    >
                                      {v.name}
                                    </Combobox.Option>
                                  ))}
                                </Combobox.Options>
                              </Transition>
                            </div>
                          </Combobox>
                        ) : (
                          <div className="p-3 bg-white border border-gray-200 rounded-md space-y-3">
                            <input
                              type="text"
                              placeholder="Nombre del Buque"
                              className="w-full text-xs rounded-md border-gray-300 font-bold text-black bg-white"
                              value={newVesselData.name}
                              onChange={(e) =>
                                setNewVesselData({ ...newVesselData, name: e.target.value })
                              }
                            />
                            <input
                              type="text"
                              placeholder="IMO"
                              className="w-full text-xs rounded-md border-gray-300 font-bold text-black bg-white"
                              value={newVesselData.imo}
                              onChange={(e) =>
                                setNewVesselData({ ...newVesselData, imo: e.target.value })
                              }
                            />
                            <button
                              type="button"
                              onClick={handleCreateVessel}
                              disabled={isSavingEntity}
                              className="w-full py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                              {isSavingEntity ? 'Guardando...' : 'Guardar Buque'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* BUSCADOR DE VIAJE */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-bold text-black">Viaje (Voyage) *</label>
                          <button
                            type="button"
                            disabled={!selectedVessel}
                            onClick={() => setShowVoyageForm(!showVoyageForm)}
                            className="text-[10px] font-black text-indigo-600 hover:underline disabled:text-gray-400"
                          >
                            {showVoyageForm ? 'Cancelar' : '+ Crear Nuevo Viaje'}
                          </button>
                        </div>

                        {!showVoyageForm ? (
                          <Combobox value={selectedVoyage} onChange={handleVoyageSelection}>
                            <div className="relative">
                              <Combobox.Input
                                className="w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm pr-10 font-bold bg-white focus:ring-indigo-500"
                                onChange={(e) => setVoyageQuery(e.target.value)}
                                displayValue={(v: any) => v?.voyageCode || ''}
                                placeholder="Buscar viaje..."
                              />
                              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                              </Combobox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition duration-100 ease-in"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {filteredVoyages.map((v) => (
                                    <Combobox.Option
                                      key={v._id}
                                      value={v}
                                      className={({ active }) =>
                                        `cursor-default select-none py-2 pl-10 pr-4 ${
                                          active ? 'bg-indigo-600 text-white' : 'text-black bg-white'
                                        }`
                                      }
                                    >
                                      {v.voyageCode} {v.vessel ? `(${v.vessel})` : ''}
                                    </Combobox.Option>
                                  ))}
                                </Combobox.Options>
                              </Transition>
                            </div>
                          </Combobox>
                        ) : (
                          <div className="p-3 bg-white border border-gray-200 rounded-md space-y-3">
                            <input
                              type="text"
                              placeholder="Código de Viaje (Ej: 001E)"
                              className="w-full text-xs rounded-md border-gray-300 font-bold text-black bg-white"
                              value={newVoyageData.voyageCode}
                              onChange={(e) =>
                                setNewVoyageData({ ...newVoyageData, voyageCode: e.target.value })
                              }
                            />
                            <div className="text-[10px] text-black font-black px-1 uppercase">
                              Buque: {selectedVessel?.name || 'Error'}
                            </div>
                            <button
                              type="button"
                              onClick={handleCreateVoyage}
                              disabled={isSavingEntity}
                              className="w-full py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                              {isSavingEntity ? 'Guardando...' : 'Guardar Viaje'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- SECCIÓN DE FECHAS ETD / ETA --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <label className="block text-sm font-bold text-black">ETD *</label>
                      <input
                        type="date"
                        name="etd"
                        value={formData.etd}
                        onChange={handleInputChange}
                        required
                        disabled={isEditing}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black text-xs font-bold bg-white ${
                          isEditing ? 'bg-gray-200 cursor-not-allowed opacity-60' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black">ETA *</label>
                      <input
                        type="date"
                        name="eta"
                        value={formData.eta}
                        onChange={handleInputChange}
                        required
                        disabled={isEditing}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black text-xs font-bold bg-white ${
                          isEditing ? 'bg-gray-200 cursor-not-allowed opacity-60' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-black">
                          Aceptación de Carga *
                        </label>
                        <select
                          name="cargo_acceptance"
                          value={formData.cargo_acceptance}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black text-xs font-bold bg-white focus:ring-indigo-500"
                        >
                          <option value="" className="bg-white text-black">
                            Seleccionar...
                          </option>
                          <option value="ACEPTA" className="bg-white text-black">
                            SI
                          </option>
                          <option value="NO ACEPTA" className="bg-white text-black">
                            NO
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black">
                          Tipo de Carga (FCL / LCL) *
                        </label>
                        <select
                          name="fcl_lcl"
                          value={formData.fcl_lcl}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black text-xs font-bold bg-white focus:ring-indigo-500"
                        >
                          <option value="" className="bg-white text-black">
                            Seleccionar...
                          </option>
                          <option value="FCL" className="bg-white text-black">
                            FCL
                          </option>
                          <option value="LCL" className="bg-white text-black">
                            LCL
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black">Servicio *</label>
                      <select
                        name="service_id"
                        value={formData.service_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm font-bold bg-white focus:ring-indigo-500"
                      >
                        <option value="" className="bg-white text-black">
                          Seleccionar...
                        </option>
                        {(services || []).map(
                          (item) =>
                            item?._id && (
                              <option key={item._id} value={item._id} className="bg-white text-black">
                                {item.name}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black">Terminal *</label>
                      <select
                        name="terminal_id"
                        value={formData.terminal_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm font-bold bg-white focus:ring-indigo-500"
                      >
                        <option value="" className="bg-white text-black">
                          Seleccionar...
                        </option>
                        {(terminals || []).map(
                          (item) =>
                            item?._id && (
                              <option key={item._id} value={item._id} className="bg-white text-black">
                                {item.name}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <h4 className="text-sm font-black text-black mb-2">Ajustes Finales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-black">ETD Final</label>
                        <input
                          type="date"
                          name="final_etd"
                          value={formData.final_etd}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 text-xs text-black font-bold bg-white focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black">Cierre Doc.</label>
                        <input
                          type="date"
                          name="final_doc_closing"
                          value={formData.final_doc_closing}
                          readOnly
                          className="mt-1 block w-full rounded-md border-gray-200 text-xs bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black">Cierre Aduana</label>
                        <input
                          type="date"
                          name="final_customs_closing"
                          value={formData.final_customs_closing}
                          readOnly
                          className="mt-1 block w-full rounded-md border-gray-200 text-xs bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black">ETA Final</label>
                        <input
                          type="date"
                          name="final_eta"
                          value={formData.final_eta}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 text-xs text-black font-bold bg-white focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black">Observaciones</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black sm:text-sm font-bold bg-white focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <div className="mt-6 flex justify-end gap-4 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 transition-colors font-bold shadow-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm font-bold"
                    >
                      {isEditing ? 'Guardar Cambios' : 'Crear Itinerario'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}