import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'

import forge from '../forge'
import { rentalPaymentSettings } from '../schema.drizzle'

const settingsDto = createSelectSchema(rentalPaymentSettings)

const settingsInputDto = settingsDto.omit({ id: true }).partial()

export const get = forge
  .query({
    description: 'Get user settings',
    output: {
      OK: settingsDto
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
      const existing = await db.query.settings.findFirst()

      if (existing) {
        const walletAvailable = await checkModulesAvailability(
          'lifeforge--wallet'
        )

        if (
          !walletAvailable &&
          (existing.link_with_wallet || existing.wallet_template_id)
        ) {
          const [updated] = await db
            .update(rentalPaymentSettings)
            .set({ link_with_wallet: false, wallet_template_id: '' })
            .where(eq(rentalPaymentSettings.id, existing.id))
            .returning()

          return response.ok(updated)
        }

        return response.ok(existing)
      }

      const [created] = await db
        .insert(rentalPaymentSettings)
        .values({
          initial_prepayment: 0,
          initial_meter_reading: 0,
          electricity_rate: 0,
          utility_bill: 0,
          rental_fee: 0
        })
        .returning()

      return response.ok(created)
    }
  )

export const update = forge
  .mutation({
    description: 'Update user settings',
    input: {
      body: settingsInputDto
    },
    output: {
      OK: settingsDto
    }
  })
  .callback(async ({ db, body, response }) => {
    const existing = await db.query.settings.findFirst()

    if (!existing) {
      const [created] = await db
        .insert(rentalPaymentSettings)
        .values(body)
        .returning()

      return response.ok(created)
    }

    const [updated] = await db
      .update(rentalPaymentSettings)
      .set(body)
      .where(eq(rentalPaymentSettings.id, existing.id))
      .returning()

    return response.ok(updated)
  })
