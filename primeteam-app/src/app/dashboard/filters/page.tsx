'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { useItineraryActions } from '@/lib/hooks/useItineraryActions'

type CargoType = 'FCL' | 'LCL'

type FiltersState = {
  shippingLine: string
  shippingLineText: string
  pol: string
  pod: string
  imo_acceptance: string
  service: string
  terminal: string
  etd_start: string
  etd_end: string
  doc_closing_start: string
  doc_closing_end: string
  search_query: string
  fcl_lcl: CargoType
}

type CatalogItem = {
  _id: string
  name: string
}

type Itinerary = {
  _id: string
  vessel?: string
  voyage?: string
  shippingLine?: string
  transit_time?: number | string
  pol?: string
  pod?: string
  etd?: string | Date
  eta?: string | Date
  final_doc_closing?: string | Date
  final_customs_closing?: string | Date
  terminal?: string
  service?: string
  remarks?: string
}

const initialFilters: FiltersState = {
  shippingLine: '',
  shippingLineText: '',
  pol: '',
  pod: '',
  imo_acceptance: '',
  service: '',
  terminal: '',
  etd_start: '',
  etd_end: '',
  doc_closing_start: '',
  doc_closing_end: '',
  search_query: '',
  fcl_lcl: 'FCL',
}

export default function FiltersPage() {
  const [filters, setFilters] = useState<FiltersState>(initialFilters)
  const [shippingLines, setShippingLines] = useState<CatalogItem[]>([])
  const [ports, setPorts] = useState<CatalogItem[]>([])
  const [terminals, setTerminals] = useState<CatalogItem[]>([])
  const [services, setServices] = useState<CatalogItem[]>([])

  // Estados de resultados y selección
  const [filteredItineraries, setFilteredItineraries] = useState<Itinerary[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isShowingSelection, setIsShowingSelection] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para descarga de PDF
  const [formData] = useState({
    nombre: 'Dashboard User',
    correo: 'dashboard@primeteam.com',
    telefono: '',
    empresa: 'PrimeTeam',
    mensaje: 'Generado desde Dashboard Filters',
  })
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const selectedItinerariesForExport = useMemo(() => {
    return filteredItineraries
      .filter((it) => selectedIds.includes(it._id))
      .map((it) => ({ it, id: it._id }))
  }, [filteredItineraries, selectedIds])

  const selectedPolItem = useMemo(
    () => ports.find((p) => p._id === filters.pol) ?? null,
    [ports, filters.pol]
  )

  const selectedPodItem = useMemo(
    () => ports.find((p) => p._id === filters.pod) ?? null,
    [ports, filters.pod]
  )

  const {
    isLoading: isActionLoading,
    handleSubmitReservation: handleDownloadOnly,
  } = useItineraryActions({
    selectedItineraries: selectedItinerariesForExport,
    formData,
    selectedPol: selectedPolItem as any,
    selectedPod: selectedPodItem as any,
    cargoType: 'FCL', // Default for dashboard filters
    onSuccess: (msg) => setActionFeedback({ type: 'success', message: msg }),
    onError: (msg) => setActionFeedback({ type: 'error', message: msg }),
  })

  const formatCustomDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'TBA'

    const date = new Date(dateString)

    // Usamos Intl.DateTimeFormat para obtener el formato: día, mes corto, año
    const formatter = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    // El resultado suele ser algo como "19 mar 2026" o "19 mar. 2026"
    // Reemplazamos el punto (si existe) y pasamos a mayúsculas
    return formatter.format(date).replace('.', '').toUpperCase()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linesRes, portsRes, termRes, servicesRes] = await Promise.all([
          fetch('/api/shipping-lines'),
          fetch('/api/ports'),
          fetch('/api/terminals'),
          fetch('/api/services'),
        ])

        const [linesData, portsData, termData, servicesData] = await Promise.all([
          linesRes.json(),
          portsRes.json(),
          termRes.json(),
          servicesRes.json(),
        ])

        setShippingLines(Array.isArray(linesData) ? linesData : [])
        setPorts(Array.isArray(portsData) ? portsData : [])
        setTerminals(Array.isArray(termData) ? termData : [])
        setServices(Array.isArray(servicesData) ? servicesData : [])
      } catch {
        setError('Error al cargar datos de filtros.')
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFilters((prev) => ({ ...prev, [name]: checked ? 'FCL' : 'LCL' }))
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFilterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFilteredItineraries([])
    setSelectedIds([])
    setIsShowingSelection(false)

    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value)
    })

    try {
      const response = await fetch(`/api/itineraries/filter?${queryParams.toString()}`)
      if (!response.ok) throw new Error('No se pudieron obtener resultados.')
      const data = await response.json()
      setFilteredItineraries(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const itinerariesToDisplay: Itinerary[] = isShowingSelection
    ? filteredItineraries.filter((it) => selectedIds.includes(it._id))
    : filteredItineraries

  const handleReset = () => {
    setFilters(initialFilters)
    setFilteredItineraries([])
    setSelectedIds([])
    setIsShowingSelection(false)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e4079]">Filtros de Itinerarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Filtra y refina los itinerarios según tus criterios
          </p>
        </div>

        <div className="flex gap-2">
          {selectedIds.length > 0 && !isShowingSelection && (
            <button
              onClick={() => setIsShowingSelection(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-sm hover:bg-green-700 transition-all"
            >
              Siguiente ({selectedIds.length})
            </button>
          )}

          {isShowingSelection && (
            <div className="flex gap-2">
              <button
                disabled={isActionLoading}
                onClick={handleDownloadOnly}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                {isActionLoading ? 'Generando...' : 'Descargar Itinerarios'}
              </button>

              <button
                onClick={() => setIsShowingSelection(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
              >
                Volver a la lista
              </button>
            </div>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-xl border ${
            actionFeedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          } mb-4 flex justify-between items-center animate-in fade-in duration-300`}
        >
          <p className="font-bold">{actionFeedback.message}</p>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-current opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {!isShowingSelection && (
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#1e4079] mb-6">Controles de Filtro</h2>

              <form onSubmit={handleFilterSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MagnifyingGlassIcon className="w-4 h-4 text-[#1e4079]" />
                      Buscador General
                    </label>
                    <input
                      type="text"
                      name="search_query"
                      value={filters.search_query}
                      onChange={handleInputChange}
                      placeholder="Buque, Viaje, Naviera..."
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-[#1e4079] focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <GlobeAltIcon className="w-4 h-4 text-[#1e4079]" />
                      Naviera
                    </label>
                    <select
                      name="shippingLine"
                      value={filters.shippingLine}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black mb-2"
                    >
                      <option value="">Todas las líneas (Seleccionar)</option>
                      {shippingLines.map((sl) => (
                        <option key={sl._id} value={sl._id}>
                          {sl.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="shippingLineText"
                      placeholder="O buscar naviera por nombre..."
                      value={filters.shippingLineText}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPinIcon className="w-4 h-4 text-[#1e4079]" />
                      Origen (POL)
                    </label>
                    <select
                      name="pol"
                      value={filters.pol}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black"
                    >
                      <option value="">Todos los orígenes</option>
                      {ports.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPinIcon className="w-4 h-4 text-amber-500" />
                      Destino (POD)
                    </label>
                    <select
                      name="pod"
                      value={filters.pod}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black"
                    >
                      <option value="">Todos los destinos</option>
                      {ports.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <ShieldCheckIcon className="w-4 h-4 text-[#1e4079]" />
                      Aceptación de carga IMO
                    </label>
                    <select
                      name="imo_acceptance"
                      value={filters.imo_acceptance}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="ACEPTA">ACEPTA</option>
                      <option value="NO ACEPTA">NO ACEPTA</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <BriefcaseIcon className="w-4 h-4 text-[#1e4079]" />
                      Servicio
                    </label>
                    <select
                      name="service"
                      value={filters.service}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black"
                    >
                      <option value="">Todos los servicios</option>
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-[#1e4079]" />
                      Terminal
                    </label>
                    <select
                      name="terminal"
                      value={filters.terminal}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm text-black"
                    >
                      <option value="">Todas las terminales</option>
                      {terminals.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <CalendarIcon className="w-4 h-4 text-[#1e4079]" />
                      Fechas (ETD)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        name="etd_start"
                        value={filters.etd_start}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-black"
                      />
                      <span className="text-gray-400 text-xs">a</span>
                      <input
                        type="date"
                        name="etd_end"
                        value={filters.etd_end}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <ClockIcon className="w-4 h-4 text-[#1e4079]" />
                      Cierre Documental
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        name="doc_closing_start"
                        value={filters.doc_closing_start}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-black"
                      />
                      <span className="text-gray-400 text-xs">a</span>
                      <input
                        type="date"
                        name="doc_closing_end"
                        value={filters.doc_closing_end}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-black"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <ArchiveBoxIcon className="w-5 h-5 text-[#1e4079]" />
                      <div>
                        <p className="text-sm font-bold text-gray-700">Tipo de Carga</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase">
                          {filters.fcl_lcl === 'FCL'
                            ? 'FCL (Full Container)'
                            : 'LCL (Less Container)'}
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="fcl_lcl"
                        checked={filters.fcl_lcl === 'FCL'}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e4079]"></div>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full text-center flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Reiniciar
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-amber-400 rounded-lg hover:bg-amber-500 shadow-sm transition-colors disabled:bg-gray-300"
                    >
                      {isLoading ? 'Filtrando...' : 'Aplicar Filtros'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div
          className={isShowingSelection ? 'lg:col-span-12 space-y-6' : 'lg:col-span-8 space-y-6'}
        >
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-[#1e4079] font-bold">
              {isShowingSelection ? 'Seleccionados' : 'Resultados Filtrados'}
            </h3>
            <p className="text-xs text-gray-500">
              Mostrando {itinerariesToDisplay.length} resultados
            </p>
          </div>

          {isLoading && (
            <p className="text-center text-gray-500 p-10 font-bold">Cargando itinerarios...</p>
          )}

          {error && <div className="p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>}

          {!isLoading && !error && itinerariesToDisplay.length === 0 && (
            <div className="text-center text-gray-500 p-10 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p>No se encontraron itinerarios.</p>
            </div>
          )}

          {itinerariesToDisplay.map((itinerary) => (
            <div
              key={itinerary._id}
              className={`bg-white rounded-2xl border ${
                selectedIds.includes(itinerary._id) ? 'border-blue-500' : 'border-gray-200'
              } shadow-sm overflow-hidden mb-4`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {!isShowingSelection && (
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(itinerary._id)}
                        onChange={() => toggleSelection(itinerary._id)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1e4079]">
                          {itinerary.vessel || 'Sin Buque'} {itinerary.voyage || ''}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded">
                            {itinerary.shippingLine}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Tiempo de Tránsito
                        </p>
                        <p className="text-lg font-black text-gray-700">
                          {itinerary.transit_time || '--'} d
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-tighter">
                          Salida (POL)
                        </p>
                        <p className="text-sm font-semibold text-gray-700">{itinerary.pol}</p>
                        <div className="flex gap-2 mt-1 text-xs text-emerald-600 font-bold">
                          <span>
                            ETD:{' '}
                            {itinerary.etd ? new Date(itinerary.etd).toLocaleDateString() : '--'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-tighter">
                          Llegada (POD)
                        </p>
                        <p className="text-sm font-semibold text-gray-700">{itinerary.pod}</p>
                        <div className="flex gap-2 mt-1 text-xs text-orange-600 font-bold">
                          <span>
                            ETA:{' '}
                            {itinerary.eta ? new Date(itinerary.eta).toLocaleDateString() : '--'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          <ShieldCheckIcon className="w-3.5 h-3.5" /> IMO: ACEPTA
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                          <ArchiveBoxIcon className="w-3.5 h-3.5" /> FCL: 20/40/HC
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedId(expandedId === itinerary._id ? null : itinerary._id)
                        }
                        className="text-xs font-bold text-[#1e4079] hover:underline flex items-center gap-1"
                      >
                        {expandedId === itinerary._id ? (
                          <>
                            Ver menos <ChevronUpIcon className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Ver Detalles <ChevronDownIcon className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>

                    {expandedId === itinerary._id && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">
                            Cierres
                          </h4>
                          <p className="text-[10px] text-gray-600">
                            Doc:{' '}
                            <b className="text-blue-800">
                              {formatCustomDate(itinerary.final_doc_closing)}
                            </b>
                          </p>
                          <p className="text-[10px] text-gray-600">
                            Aduana:{' '}
                            <b className="text-blue-800">
                              {formatCustomDate(itinerary.final_customs_closing)}
                            </b>
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">
                            Operación
                          </h4>
                          <p className="text-[10px] text-gray-600">
                            Terminal: <b>{itinerary.terminal || 'TBA'}</b>
                          </p>
                          <p className="text-[10px] text-gray-600">
                            Servicio: <b>{itinerary.service || 'N/A'}</b>
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">
                            Notas
                          </h4>
                          <p className="text-[10px] text-gray-500 italic">
                            {itinerary.remarks || 'Sin notas.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}