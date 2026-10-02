import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'voyage',
  title: 'Voyage',
  type: 'document',
  fields: [
    defineField({
      name: 'voyageCode',
      title: 'Voyage Code',
      description: 'The unique code for the voyage (e.g., "123W")',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'vessel',
      title: 'Vessel',
      type: 'reference',
      to: [{type: 'vessel'}],
      description: 'The vessel making the voyage (optional).',
    }),
    // This field can be used to store the combined vessel + voyage string
    // that the user might have entered, for historical/auditing purposes.
    defineField({
        name: 'rawVesselVoyage',
        title: 'Raw Vessel/Voyage Input',
        type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'voyageCode',
      subtitle: 'vessel.name',
    },
    prepare({title, subtitle}) {
        return {
            title: title,
            subtitle: subtitle ? `Vessel: ${subtitle}` : 'No vessel assigned'
        }
    }
  },
})
