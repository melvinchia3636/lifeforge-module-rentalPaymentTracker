import forge from '../forge'
import schemas from '../schema'

export const get = forge
  .query({
    description: 'Get user settings',
    output: {
      OK: schemas.settings
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
      const existing = await pb.getFullList.collection('settings').execute()

      if (existing.length > 0) {
        const walletModuleAvailable = checkModulesAvailability('wallet')

        if (!walletModuleAvailable) {
          return response.ok(
            await pb.update
              .collection('settings')
              .id(existing[0].id)
              .data({ link_with_wallet: false, wallet_template_id: '' })
              .execute()
          )
        }

        return response.ok(existing[0])
      }

      return response.ok(
        await pb.create
          .collection('settings')
          .data({
            initial_prepayment: 0,
            initial_meter_reading: 0,
            electricity_rate: 0,
            utility_bill: 0,
            rental_fee: 0
          })
          .execute()
      )
    }
  )

export const update = forge
  .mutation({
    description: 'Update user settings',
    input: {
      body: schemas.settings.partial()
    },
    output: {
      OK: schemas.settings
    }
  })
  .callback(async ({ pb, body, response }) => {
    const existing = await pb.getFullList.collection('settings').execute()

    if (existing.length === 0) {
      return response.ok(
        await pb.create.collection('settings').data(body).execute()
      )
    }

    return response.ok(
      await pb.update
        .collection('settings')
        .id(existing[0].id)
        .data(body)
        .execute()
    )
  })
