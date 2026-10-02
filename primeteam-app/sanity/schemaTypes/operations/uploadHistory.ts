import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'uploadHistory',
  title: 'Upload History',
  type: 'document',
  fields: [
    defineField({
      name: 'file_name',
      title: 'File Name',
      type: 'string',
    }),
    defineField({
      name: 'uploaded_at',
      title: 'Uploaded At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'uploaded_by',
      title: 'Uploaded By',
      type: 'reference',
      to: [{type: 'person'}],
    }),
    defineField({
      name: 'version_tag',
      title: 'Version Tag',
      type: 'string',
    }),
  ],
})
