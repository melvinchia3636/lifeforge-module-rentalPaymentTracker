import z from 'zod'

import forge from '../forge'
import { getWalletTemplates as fetchWalletTemplates } from '../utils/walletLink'

const walletTemplateDto = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal('expenses'),
  amount: z.number(),
  particulars: z.string(),
  asset: z.string().nullable(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    color: z.string()
  }),
  ledgers: z.array(z.string()),
  location_name: z.string(),
  location_coords: z
    .object({
      lat: z.number(),
      lon: z.number()
    })
    .nullable()
})

export const getWalletTemplates = forge
  .query({
    description: 'Get the list of templates from the wallet module',
    output: {
      OK: z.array(walletTemplateDto)
    }
  })
  .callback(
    async ({
      db,
      core: {
        validation: { checkModulesAvailability }
      },
      response
    }) => {
      const walletAvailable = await checkModulesAvailability(
        'lifeforge--wallet'
      )

      if (!walletAvailable) {
        return response.ok([])
      }

      return response.ok(await fetchWalletTemplates(db))
    }
  )
