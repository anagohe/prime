import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'itinerary',
  title: 'Itinerary',
  type: 'document',
  fields: [
    defineField({
      name: 'shipping_line',
      title: 'Shipping Line',
      type: 'reference',
      to: [{type: 'shippingLine'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'route',
      title: 'Route',
      type: 'reference',
      to: [{type: 'route'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{type: 'service'}],
      description: 'Optional service associated with this itinerary.',
    }),
    defineField({
      name: 'voyage',
      title: 'Voyage',
      type: 'reference',
      to: [{type: 'voyage'}],
      description: 'The specific voyage for this itinerary leg.',
    }),
    defineField({
      name: 'etd',
      title: 'ETD (Estimated Time of Departure)',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eta',
      title: 'ETA (Estimated Time of Arrival)',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'transit_time',
      title: 'Transit Time (days)',
      type: 'number',
      readOnly: true, // Should be calculated automatically
    }),
    defineField({
      name: 'final_etd',
      title: 'Final ETD',
      type: 'date',
    }),
    defineField({
      name: 'final_eta',
      title: 'Final ETA',
      type: 'date',
    }),
    defineField({
      name: 'final_transit_time_days',
      title: 'Final Transit Time (days)',
      type: 'number',
    }),
    defineField({
      name: 'final_doc_closing',
      title: 'Final Documentation Closing',
      type: 'date',
    }),
    defineField({
      name: 'final_customs_closing',
      title: 'Final Customs Closing',
      type: 'date',
    }),
    defineField({
      name: 'ts_port',
      title: 'Transshipment Port',
      type: 'reference',
      to: [{type: 'port'}],
      description: 'Optional transshipment port if applicable.',
    }),
    defineField({
      name: 'remarks',
      title: 'Remarks',
      type: 'text',
    }),
    defineField({
      name: 'terminal',
      title: 'Terminal',
      type: 'reference',
      to: [{type: 'terminal'}],
      description: 'Optional terminal for this itinerary leg.',
    }),
    defineField({
      name: 'cargo_acceptance',
      title: 'Cargo Acceptance',
      type: 'string',
      options: {
        list: [
          {title: 'Acepta', value: 'ACEPTA'},
          {title: 'No Acepta', value: 'NO ACEPTA'},
        ],
      },
    }),
    defineField({
      name: 'fcl_lcl',
      title: 'FCL / LCL',
      type: 'string',
      options: {
        list: [
          {title: 'FCL', value: 'FCL'},
          {title: 'LCL', value: 'LCL'},
        ],
      },
    }),
  ],
  preview: {
    select: {
      routeLabel: 'route.label',
      shippingLine: 'shipping_line.name',
      voyageCode: 'voyage.voyageCode',
      vesselName: 'voyage.vessel.name',
    },
    prepare({routeLabel, shippingLine, voyageCode, vesselName}) {
      const voyageInfo = [vesselName, voyageCode].filter(Boolean).join(' ')
      return {
        title: `${routeLabel || 'No Route'} - ${voyageInfo || 'TBA'}`,
        subtitle: shippingLine || 'No shipping line',
      }
    },
  },
})
