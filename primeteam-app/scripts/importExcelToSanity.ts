import { createClient, type SanityDocumentStub } from '@sanity/client'
import * as XLSX from 'xlsx'

// --- 1. CONFIGURACIÓN DEL CLIENTE DE SANITY ---
// Asegúrate de tener estas variables en tu entorno
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ewic3pd1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN, // ¡NECESARIO! Token con permisos de escritura
  useCdn: false,
  apiVersion: '2024-01-24',
})

// --- 2. FUNCIÓN HELPER "FIND OR CREATE" (UPSERT) ---
/**
 * Busca un documento en Sanity por un campo único. Si no lo encuentra, lo crea.
 * Devuelve el _id del documento encontrado o recién creado.
 * @param docType - El _type del schema (ej: 'port', 'person').
 * @param queryField - El campo por el cual buscar (ej: 'code', 'fullName').
 * @param queryValue - El valor a buscar.
 * @param creationData - Datos adicionales para usar si el documento necesita ser creado.
 */
async function findOrCreate(
  docType: string,
  queryField: string,
  queryValue: any,
  creationData: Record<string, any> = {}
): Promise<string> {
  if (!queryValue) {
    throw new Error(`Valor de búsqueda para ${docType}.${queryField} no puede ser nulo.`)
  }

  const query = `*[_type == $docType && ${queryField} == $queryValue][0]._id`
  const params = { docType, queryValue }

  let docId = await sanityClient.fetch<string | null>(query, params)

  if (!docId) {
    console.log(`No se encontró ${docType} con ${queryField}="${queryValue}". Creando nuevo...`)
    const newDoc: SanityDocumentStub = {
      _type: docType,
      ...creationData,
      [queryField]: queryValue,
    }

    const createdDoc = await sanityClient.create(newDoc)
    docId = createdDoc._id
    console.log(`Creado ${docType} con ID: ${docId}`)
  }

  return docId
}

// --- 3. FUNCIÓN PRINCIPAL DE IMPORTACIÓN ---
/**
 * Lee un archivo de Excel, procesa cada fila y crea itinerarios en Sanity,
 * verificando y creando catálogos relacionados (puertos, rutas, etc.) si no existen.
 * @param filePath - La ruta al archivo .xlsx o .xlsb
 */
export async function importExcelToSanity(filePath: string) {
  console.log(`Iniciando importación desde: ${filePath}`)

  // Leer el archivo Excel
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet)

  console.log(`Se encontraron ${rows.length} filas para procesar.`)

  for (const row of rows) {
    const transaction = sanityClient.transaction()
    const rowData = row as Record<string, any>

    try {
      console.log(`--- Procesando fila: ${JSON.stringify(rowData)} ---`)

      // 1. Puertos y Rutas
      const polId = await findOrCreate('port', 'code', rowData.POL, { name: rowData.POL })
      const podId = await findOrCreate('port', 'code', rowData.POD, { name: rowData.POD })

      const routeLabel = `${rowData.POL} - ${rowData.POD}`
      const routeQuery = `*[_type == "route" && originPort._ref == $polId && destinationPort._ref == $podId][0]._id`
      let routeId = await sanityClient.fetch<string | null>(routeQuery, { polId, podId })

      if (!routeId) {
        console.log(`No se encontró ruta para ${routeLabel}. Creando nueva...`)
        const newRouteDoc: SanityDocumentStub = {
          _type: 'route',
          label: routeLabel,
          originPort: { _type: 'reference', _ref: polId },
          destinationPort: { _type: 'reference', _ref: podId },
          slug: { _type: 'slug', current: `${rowData.POL}-${rowData.POD}`.toLowerCase() },
        }

        const createdRoute = await sanityClient.create(newRouteDoc)
        routeId = createdRoute._id
        console.log(`Ruta creada con ID: ${routeId}`)
      }

      // 2. Navieras y Buques
      const shippingLineId = await findOrCreate(
        'shippingLine',
        'name',
        rowData.NAVIERA,
        { code: rowData.NAVIERA.substring(0, 3) }
      )
      const vesselId = await findOrCreate('vessel', 'name', rowData.BUQUE)

      // (Opcional) Terminal y Servicio
      const terminalId = rowData.TERMINAL
        ? await findOrCreate('terminal', 'name', rowData.TERMINAL, {
            port: { _type: 'reference', _ref: polId },
          })
        : undefined

      const serviceId = rowData.SERVICIO
        ? await findOrCreate('service', 'code', rowData.SERVICIO)
        : undefined

      // 3. Responsable (Person)
      let responsibleId: string | undefined = undefined
      if (rowData.RESPONSABLE) {
        responsibleId = await findOrCreate('person', 'fullName', rowData.RESPONSABLE)
      }

      // 4. Creación del Itinerario
      const itineraryDoc: SanityDocumentStub = {
        _type: 'itinerary',
        route: { _type: 'reference', _ref: routeId },
        shippingLine: { _type: 'reference', _ref: shippingLineId },
        vessel: { _type: 'reference', _ref: vesselId },
        voyage: rowData.VIAJE,
        ...(terminalId ? { terminal: { _type: 'reference', _ref: terminalId } } : {}),
        ...(serviceId ? { service: { _type: 'reference', _ref: serviceId } } : {}),
        // ... (mapear el resto de los campos de fecha y estado aquí)
        etd: new Date(rowData.ETD),
        eta: new Date(rowData.ETA),
      }

      console.log('Documento de itinerario preparado:', itineraryDoc)
      transaction.create(itineraryDoc)

      // (Opcional) Si se encontró un responsable, crear el `routeDirectory` si no existe
      if (responsibleId) {
        const directoryQuery = `*[_type == "routeDirectory" && route._ref == $routeId][0]._id`
        const directoryId = await sanityClient.fetch<string | null>(directoryQuery, { routeId })

        if (!directoryId) {
          console.log(`Creando RouteDirectory para la ruta ${routeLabel}`)
          const routeDirectoryDoc: SanityDocumentStub = {
            _type: 'routeDirectory',
            route: { _type: 'reference', _ref: routeId },
            responsible: { _type: 'reference', _ref: responsibleId },
          }

          transaction.create(routeDirectoryDoc)
        }
      }

      await transaction.commit()
      console.log('Fila procesada y guardada exitosamente.')
    } catch (error) {
      console.error(`Error procesando la fila ${JSON.stringify(rowData)}:`, error)
      // Opcional: decidir si continuar con las siguientes filas o detener el script
    }
  }

  console.log('--- Importación finalizada ---')
}

// --- 4. EJEMPLO DE CÓMO USAR EL SCRIPT ---
/*
  Para usar este script:
  1. Guárdalo como `import.ts` en una carpeta `scripts`.
  2. Asegúrate de tener `ts-node` y `typescript` instalados (`npm install -g ts-node typescript`).
  3. Crea un archivo .env en la raíz con tu SANITY_API_WRITE_TOKEN.
  4. Ejecútalo desde la terminal con: `ts-node scripts/import.ts`
  5. Asegúrate de tener un archivo `itineraries.xlsx` en la raíz, o cambia la ruta en la llamada.
*/
// Ejemplo de llamada (descomentar para probar):
// importExcelToSanity('./itineraries.xlsx').catch(console.error);