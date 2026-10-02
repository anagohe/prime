import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'shippingLine',
  title: 'Shipping Line',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
    }),
  ],
})
