import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'terminal',
  title: 'Terminal',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'port',
      title: 'Port',
      type: 'reference',
      to: [{type: 'port'}],
    }),
  ],
})
