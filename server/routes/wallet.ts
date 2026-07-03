import z from 'zod'

import forge from '../forge'

export const getWalletTemplates = forge
  .query({
    description: 'Get the list of templates from the wallet module',
    output: {
      OK: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.literal('expenses'),
          amount: z.number(),
          particulars: z.string(),
          asset: z.string(),
          category: z.object({
            id: z.string(),
            name: z.string(),
            icon: z.string(),
            color: z.string()
          }),
          ledgers: z.array(z.string()),
          location_name: z.string(),
          location_coords: z.object({
            lat: z.number(),
            lon: z.number()
          })
        })
      )
    }
  })
  .callback(
    async ({
      pb,
      core: {
        validation: { checkModulesAvailability }
      },
      response
    }) => {
      const walletAvailable =
        await checkModulesAvailability('lifeforge--wallet')

      if (!walletAvailable) {
        return response.ok([])
      }

      const templates = await pb.instance
        .collection('wallet__transaction_templates')
        .getFullList(undefined, {
          sort: 'name',
          filter: "type = 'expenses'",
          expand: 'category'
        })

      return response.ok(
        templates.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type as 'expenses',
          amount: t.amount,
          particulars: t.particulars,
          asset: t.asset,
          category: {
            id: t.category,
            name: t.expand?.category?.name ?? '',
            icon: t.expand?.category?.icon ?? '',
            color: t.expand?.category?.color ?? ''
          },
          ledgers: t.ledgers,
          location_name: t.location_name,
          location_coords: t.location_coords
        }))
      )
    }
  )
