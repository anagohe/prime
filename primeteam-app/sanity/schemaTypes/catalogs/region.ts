import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  // @ts-ignore - this is used to hide it from global search and lists effectively
  __experimental_search: [],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
