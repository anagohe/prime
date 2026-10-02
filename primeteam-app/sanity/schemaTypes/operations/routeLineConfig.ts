import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'routeLineConfig',
  title: 'Route Line Config',
  type: 'document',
  fields: [
    defineField({
      name: 'route',
      title: 'Route',
      type: 'reference',
      to: [{type: 'route'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shippingLine',
      title: 'Shipping Line',
      type: 'reference',
      to: [{type: 'shippingLine'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{type: 'service'}],
      description: 'Optional service for this configuration.',
    }),
    defineField({
      name: 'terminal',
      title: 'Terminal',
      type: 'reference',
      to: [{type: 'terminal'}],
      description: 'Optional terminal for this configuration.',
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
  ],
  // Unique constraint for route + shippingLine + service + terminal
  validation: (Rule) =>
    Rule.custom(async (fields, context) => {
      const {document, getClient} = context
      if (!document || !document.route || !document.shippingLine) {
        return true // Not enough fields to validate yet
      }

      const client = getClient({apiVersion: '2024-05-01'})
      
      const serviceId = (document.service as any)?._ref || null
      const terminalId = (document.terminal as any)?._ref || null

      let query = `
        count(*[_type == "routeLineConfig" && 
               route._ref == $routeId && 
               shippingLine._ref == $shippingLineId &&
               !(_id in [$draftId, $publishedId])
      `
      
      const params: any = {
        routeId: (document.route as any)._ref,
        shippingLineId: (document.shippingLine as any)._ref,
        draftId: `drafts.${document._id}`,
        publishedId: document._id,
      }

      if (serviceId) {
        query += ` && service._ref == $serviceId`
        params.serviceId = serviceId
      } else {
        query += ` && !defined(service)`
      }

      if (terminalId) {
        query += ` && terminal._ref == $terminalId`
        params.terminalId = terminalId
      } else {
        query += ` && !defined(terminal)`
      }

      query += `])`

      const count = await client.fetch(query, params)

      return count > 0 ? 'A configuration with the same route, shipping line, service, and terminal already exists.' : true
    }),
  preview: {
    select: {
      routeLabel: 'route.label',
      lineName: 'shippingLine.name',
      serviceName: 'service.name',
      terminalName: 'terminal.name',
    },
    prepare({routeLabel, lineName, serviceName, terminalName}) {
      const title = `${routeLabel} - ${lineName}`
      const subtitle = [serviceName, terminalName].filter(Boolean).join(' | ')
      return {
        title,
        subtitle: subtitle || 'General Config',
      }
    },
  },
})
