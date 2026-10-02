import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'port',
  title: 'Port',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Port Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Port Code',
      type: 'string',
      description: 'E.g., MXVER for Veracruz',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{type: 'country'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Port Type',
      type: 'string',
      options: {
        list: [
          { title: 'POL (Origin)', value: 'POL' },
          { title: 'POD (Destination)', value: 'POD' },
          { title: 'BOTH', value: 'BOTH' },
        ],
      },
      initialValue: 'BOTH',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'country.name',
    },
  },
})
