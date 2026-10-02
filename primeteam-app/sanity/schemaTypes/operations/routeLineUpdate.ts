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
      name: 'manual_status',
      title: 'Estado de Actualización',
      type: 'string',
      options: {
        list: [
          {title: 'ACTUALIZADO', value: 'ACTUALIZADO'},
          {title: 'PENDIENTE', value: 'PENDIENTE'},
        ],
      },
      initialValue: 'PENDIENTE',
    }),
    defineField({
      name: 'status',
      title: 'Status Operativo',
      type: 'string',
      options: {
        list: [
          {title: 'ACTIVA', value: 'ACTIVA'},
          {title: 'INACTIVA', value: 'INACTIVA'},
        ],
      },
      initialValue: 'ACTIVA',
    }),
    defineField({
      name: 'upload',
      title: 'Upload History',
      type: 'reference',
      to: [{type: 'uploadHistory'}],
    }),
  ],
})
