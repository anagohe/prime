import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'vessel',
  title: 'Vessel',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'imo',
      title: 'IMO Number',
      type: 'string',
    }),
  ],
})
