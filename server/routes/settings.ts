import { SCHEMAS } from '@schema'

import { forgeController, forgeRouter } from '@functions/routes'
import { checkModulesAvailability } from '@functions/utils/checkModulesAvailability'

const get = forgeController
  .query()
  .description('Get user settings')
  .input({})
  .callback(async ({ pb }) => {
    // Try to get existing settings (there should only be one)
    const existing = await pb.getFullList
      .collection('melvinchia3636$rentalPaymentTracker__settings')
      .execute()

    if (existing.length > 0) {
      const walletModuleAvailable = checkModulesAvailability('wallet')

      // If wallet module is not available, ensure link_with_wallet is false
      if (!walletModuleAvailable) {
        return await pb.update
          .collection('melvinchia3636$rentalPaymentTracker__settings')
          .id(existing[0].id)
          .data({ link_with_wallet: false, wallet_template_id: '' })
          .execute()
      }

      return existing[0]
    }

    // Create default settings if none exist
    return await pb.create
      .collection('melvinchia3636$rentalPaymentTracker__settings')
      .data({
        initial_prepayment: 0,
        initial_meter_reading: 0,
        electricity_rate: 0,
        utility_bill: 0,
        rental_fee: 0
      })
      .execute()
  })

const update = forgeController
  .mutation()
  .description('Update user settings')
  .input({
    body: SCHEMAS.melvinchia3636$rentalPaymentTracker.settings.schema.partial()
  })
  .callback(async ({ pb, body }) => {
    // Get existing settings
    const existing = await pb.getFullList
      .collection('melvinchia3636$rentalPaymentTracker__settings')
      .execute()

    if (existing.length === 0) {
      // Create new settings
      return await pb.create
        .collection('melvinchia3636$rentalPaymentTracker__settings')
        .data(body)
        .execute()
    }

    // Update existing settings
    return await pb.update
      .collection('melvinchia3636$rentalPaymentTracker__settings')
      .id(existing[0].id)
      .data(body)
      .execute()
  })

export default forgeRouter({ get, update })
