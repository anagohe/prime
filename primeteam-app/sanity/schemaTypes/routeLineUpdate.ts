import {defineField, defineType} from 'sanity'
import {RefreshIcon} from '@sanity/icons'

export default defineType({
  name: 'routeLineUpdate',
  title: 'Actualización de Línea en Ruta',
  type: 'document',
  icon: RefreshIcon,
  fields: [
    defineField({
      name: 'route',
      title: 'Ruta',
      type: 'reference',
      to: [{type: 'route'}],
    }),
    defineField({
      name: 'shippingLine',
      title: 'Línea Naviera',
      type: 'reference',
      to: [{type: 'shippingLine'}],
    }),
    defineField({
      name: 'lastUpdateDate',
      title: 'Fecha de Última Actualización',
      type: 'date',
    }),
    defineField({
      name: 'responsible',
      title: 'Responsable',
      type: 'reference',
      to: [{type: 'person'}],
    }),
    defineField({
      name: 'update_day',
      title: 'Día de Actualización',
      type: 'string',
    }),
    defineField({
      name: 'manual_status',
      title: 'Estado de Actualización',
      type: 'string',
      options: {
        list: ['ACTUALIZADA', 'NO ACTUALIZADA'],
      }
    }),
    defineField({
      name: 'status',
      title: 'Estado Operativo',
      type: 'string',
      options: {
        list: ['ACTIVA', 'INACTIVA'],
      }
    }),
  ],
})
