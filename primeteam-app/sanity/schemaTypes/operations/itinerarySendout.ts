import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'itinerarySendout',
  title: 'Registro de Envío de Itinerarios',
  type: 'document',
  fields: [
    defineField({
      name: 'route',
      title: 'Ruta',
      type: 'reference',
      to: [{type: 'route'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Lugar',
      type: 'string',
    }),
    defineField({
      name: 'reviewed',
      title: 'Revisado',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'responsible',
      title: 'Responsable',
      type: 'reference',
      to: [{type: 'person'}],
      validation: (Rule) => Rule,
    }),
    defineField({
      name: 'sent_date',
      title: 'Fecha real del envío',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'week_number',
      title: 'Semana logística',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(53),
    }),
    defineField({
      name: 'is_updated_manual',
      title: '¿Está Actualizado?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          {title: 'ENVIADO', value: 'ENVIADO'},
          {title: 'PENDIENTE', value: 'PENDIENTE'},
          {title: 'RETRASADO', value: 'RETRASADO'},
        ],
      },
      validation: (Rule) => Rule,
    }),
    defineField({
      name: 'delivery_method',
      title: 'Método de Entrega',
      type: 'string',
      options: {
        list: [
          {title: 'Correo', value: 'CORREO'},
          {title: 'WhatsApp', value: 'WHATSAPP'},
          {title: 'Portal', value: 'PORTAL'},
          {title: 'Otro', value: 'OTRO'},
        ],
      },
    }),
    defineField({
      name: 'business_name',
      title: 'Razón Social',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Correo',
      type: 'string',
    }),
    defineField({
      name: 'shipping_line_name',
      title: 'Naviera de Envío',
      type: 'string',
    }),
    defineField({
      name: 'team_name',
      title: 'Nombre del Equipo',
      type: 'string',
    }),
    defineField({
      name: 'preferred_carrier',
      title: 'Preferred Carrier',
      type: 'string',
    }),
    defineField({
      name: 'sales_executive',
      title: 'Ejecutivo de Ventas',
      type: 'string',
    }),
    defineField({
      name: 'free_days_origin',
      title: 'Días Libres Origen',
      type: 'number',
    }),
    defineField({
      name: 'periodicity',
      title: 'Periodicidad',
      type: 'string',
    }),
    defineField({
      name: 'observations',
      title: 'Observaciones',
      type: 'text',
    }),
  ],
  preview: {
    select: {
      routeLabel: 'route.label',
      sentDate: 'sent_date',
      responsibleName: 'responsible.fullName',
    },
    prepare({routeLabel, sentDate, responsibleName}) {
      return {
        title: `${routeLabel || 'No Route'} - ${sentDate || 'No Date'}`,
        subtitle: `Enviado por: ${responsibleName || 'N/A'}`,
      }
    },
  },
})
