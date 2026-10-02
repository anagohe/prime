import {defineField, defineType} from 'sanity'
import {BookIcon} from '@sanity/icons'

export default defineType({
  name: 'routeDirectory',
  title: 'Directorio de Ruta',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'route',
      title: 'Ruta',
      type: 'reference',
      to: [{type: 'route'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'responsible',
      title: 'Responsable',
      description: 'La persona a cargo de esta ruta.',
      type: 'reference',
      to: [{type: 'person'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'periodicity',
      title: 'Periodicidad',
      type: 'string',
      options: {
        list: ['Semanal', 'Quincenal', 'Mensual'],
        layout: 'radio',
      }
    }),
    defineField({
      name: 'update_day',
      title: 'Día de Actualización',
      type: 'string',
      description: 'Ej: Lunes, Martes, etc.',
    }),
    defineField({
      name: 'guidelines',
      title: 'Lineamientos de la Ruta',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'status',
      title: 'Status Operativo',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'Active'},
          {title: 'Cancelled', value: 'Cancelled'},
          {title: 'Omitted', value: 'Omitted'},
        ],
      },
      initialValue: 'Active',
    }),
  ],
  preview: {
    select: {
      routeLabel: 'route.label',
      responsibleName: 'responsible.fullName',
    },
    prepare({routeLabel, responsibleName}) {
      return {
        title: routeLabel || 'Ruta sin definir',
        subtitle: `Responsable: ${responsibleName || 'No asignado'}`,
      }
    },
  },
})
