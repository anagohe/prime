import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'PrimeTeam Logistics',
  projectId: 'ewic3pd1',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Control PrimeTeam')
          .items([
            // 1. LA MATRIZ AZUL (Tus 7-47 registros de "ACTUALIZADA")
            S.documentTypeListItem('routeLineUpdate')
              .title('Directorios de Rutas (Matriz Azul)'),

            // 2. EL PANEL DE OPERACIONES (Tus 5 registros con ETD/ETA)
            S.documentTypeListItem('itinerary')
              .title('Itinerarios (Panel de Operaciones)'),

            // 3. LA CONFIGURACIÓN DE RESPONSABLES
            S.documentTypeListItem('routeDirectory')
              .title('Responsables de Ruta (Configuración)'),

            S.divider(),

            // 4. OTROS LOGS Y TABLAS
            S.documentTypeListItem('itinerarySendout').title('Reportes de Envío W13'),
            S.documentTypeListItem('route').title('Base de Rutas (Puertos)'),
            S.documentTypeListItem('uploadHistory').title('Historial Excel'),

            S.divider(),

            // 5. CATÁLOGOS (Donde hiciste la prueba del País)
            S.listItem()
              .title('Catálogos')
              .child(
                S.list()
                  .title('Catálogos de Sistema')
                  .items([
                    S.documentTypeListItem('country').title('Países'),
                    S.documentTypeListItem('port').title('Puertos'),
                    S.documentTypeListItem('shippingLine').title('Navieras'),
                    S.documentTypeListItem('person').title('Personal'),
                    S.documentTypeListItem('vessel').title('Buques'),
                  ])
              ),

            // Filtro de seguridad
            ...S.documentTypeListItems().filter(
              (listItem) => 
                ![
                  'country', 'port', 'shippingLine', 'person', 'vessel', 'route', 
                  'itinerary', 'routeDirectory', 'routeLineUpdate', 'itinerarySendout', 'uploadHistory'
                ].includes(listItem.getId()!)
            ),
          ]),
    }),
    visionTool()
  ],
  schema: { types: schemaTypes },
})