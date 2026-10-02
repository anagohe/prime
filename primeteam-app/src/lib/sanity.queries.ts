import { groq } from 'next-sanity'

// --- EXISTING QUERIES (Updated with new fields) ---

// Updated Itineraries Query
export const itinerariesQuery = groq`*[_type == "itinerary"] | order(etd desc) {
  _id,
  "shippingLine": shipping_line->name,
  "shippingLineId": shipping_line->_id,
  "service": service->name,
  "serviceId": service->_id,
  "route": route->label,
  "routeId": route->_id,
  "pol": route->originPort->name,
  "pod": route->destinationPort->name,
  "voyage": voyage->voyageCode,
  "voyageId": voyage->_id,
  "vessel": voyage->vessel->name,
  "vesselId": voyage->vessel->_id,
  "terminal": terminal->name,
  "terminalId": terminal->_id,
  etd,
  eta,
  transit_time,
  final_etd,
  final_eta,
  final_transit_time_days,
  final_doc_closing,
  final_customs_closing,
  cargo_acceptance,
  fcl_lcl,
  "tsPort": ts_port->name,
  "tsPortId": ts_port->_id,
  remarks
}`

// Query for all Itinerary Sendouts
export const itinerarySendoutsQuery = groq`*[_type == "itinerarySendout"] | order(sent_date desc) {
  _id,
  location,
  reviewed,
  "route": route->label,
  "routeId": route->_id,
  "responsible": responsible->fullName,
  "responsibleId": responsible->_id,
  sent_date,
  week_number,
  status,
  delivery_method,
  business_name,
  email,
  shipping_line_name,
  team_name,
  preferred_carrier,
  sales_executive,
  free_days_origin,
  periodicity,
  observations,
  "is_updated": count(*[_type == "routeLineUpdate" && route._ref == ^.route._ref && manual_status == 'ACTUALIZADA']) > 0
}`

// Query for all Services
export const servicesQuery = groq`*[_type == "service"] | order(name asc) {
  _id,
  name,
  code
}`

// Query for all Voyages
export const voyagesQuery = groq`*[_type == "voyage"] | order(voyageCode asc) {
  _id,
  voyageCode,
  "vessel": vessel->name,
  "vesselId": vessel->_id,
  rawVesselVoyage
}`

// Query for all Route Line Configs
export const routeLineConfigsQuery = groq`*[_type == "routeLineConfig"] {
  _id,
  "route": route->label,
  "routeId": route->_id,
  "shippingLine": shippingLine->name,
  "shippingLineId": shippingLine->_id,
  "service": service->name,
  "serviceId": service->_id,
  "terminal": terminal->name,
  "terminalId": terminal->_id,
  cargo_acceptance
}`

// --- UNMODIFIED / UPDATED QUERIES ---

// Consulta para obtener todos los puertos
export const portsQuery = groq`*[_type == "port"] | order(name asc) {
  _id,
  name,
  code,
  type,
  "country": country->name,
  "countryId": country->_id,
  "countryIso": country->iso3166
}`

// Consulta para obtener todas las líneas navieras
export const shippingLinesQuery = groq`*[_type == "shippingLine"] | order(name asc) {
  _id,
  name,
  code
}`

// Consulta para obtener todos los buques
export const vesselsQuery = groq`*[_type == "vessel"] | order(name asc) {
  _id,
  name,
  imo
}`

// Consulta para obtener todas las terminales
export const terminalsQuery = groq`*[_type == "terminal"] | order(name asc) {
  _id,
  name,
  "port": port->name,
  "portId": port->_id
}`

// Consulta para obtener todos los países
export const countriesQuery = groq`*[_type == "country"] | order(name asc) {
  _id,
  name,
  iso3166,
  "region": region->name,
  "regionId": region->_id
}`

// Consulta para obtener todas las rutas
export const routesQuery = groq`*[_type == "route"] | order(label asc) {
  _id,
  label,
  "originPort": originPort->name,
  "destinationPort": destinationPort->name,
  "originPortId": originPort->_id,
  "destinationPortId": destinationPort->_id
}`

// Consulta para obtener todas las personas/responsables
export const peopleQuery = groq`*[_type == "person"] | order(fullName asc) {
  _id,
  fullName,
  email,
  role
}`

// Consulta para obtener todos los directorios de ruta
export const routeDirectoriesQuery = groq`*[_type == "routeDirectory"] | order(route->label asc) {
  _id,
  "route": route->label,
  "routeId": route->_id,
  "responsible": responsible->fullName,
  "responsibleId": responsible->_id,
  periodicity,
  update_day,
  guidelines,
  "lineUpdates": *[_type == "routeLineUpdate" && route._ref == ^.route._ref] {
    _id,
    "shippingLine": shippingLine->name,
    lastUpdateDate,
    manual_status
  }
}`

// Consulta para obtener todas las actualizaciones de líneas en rutas (Enriquecida)
export const routeLineUpdatesQuery = groq`*[_type == "routeLineUpdate"] | order(lastUpdateDate desc) {
  _id,
  "route": route->label,
  "routeId": route->_id,
  "shippingLine": shippingLine->name,
  "shippingLineId": shippingLine->_id,
  lastUpdateDate,
  manual_status,
  status,
  "responsible": responsible->fullName,
  "responsibleId": responsible->_id,
  update_day,
  "upload": upload->file_name,
  "uploadId": upload->_id
}`

// --- NEW QUERIES ---

// Query for all Regions
export const regionsQuery = groq`*[_type == "region"] | order(name asc) {
  _id,
  name
}`

// Query for Upload History
export const uploadHistoryQuery = groq`*[_type == "uploadHistory"] | order(uploaded_at desc) {
  _id,
  file_name,
  uploaded_at,
  "uploadedBy": uploaded_by->fullName,
  version_tag
}`