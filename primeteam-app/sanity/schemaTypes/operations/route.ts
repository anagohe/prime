import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'route',
  title: 'Route',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      description: 'Ej: Manzanillo - Arica',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'label',
        maxLength: 150,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'originPort',
      title: 'Puerto de Origen',
      type: 'reference',
      to: [{type: 'port'}]
    }),
    defineField({
      name: 'destinationPort',
      title: 'Puerto de Destino',
      type: 'reference',
      to: [{type: 'port'}]
    }),
  ],
  preview: {
    select: {
      title: 'label'
    }
  }
})
