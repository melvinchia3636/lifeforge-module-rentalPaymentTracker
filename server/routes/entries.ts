import { and, desc, eq, ne } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import dayjs from 'dayjs'
import z from 'zod'

import forge from '../forge'
import { rentalPaymentEntries } from '../schema.drizzle'
import {
  getWalletTemplate,
  getWalletTransaction,
  createWalletTransaction,
  updateWalletTransactionSchedule
} from '../utils/walletLink'

const entryDto = createSelectSchema(rentalPaymentEntries)

const entryFields = {
  month: z.number(),
  year: z.number(),
  previous_meter_reading: z.number(),
  current_meter_reading: z.number(),
  electricity_used: z.number(),
  electricity_rate: z.number(),
  utility_bill: z.number(),
  rental_fee: z.number(),
  amount_paid: z.number(),
  wallet_entry_id: z.string().optional()
}

const createInputDto = z.object({
  ...entryFields,
  auto_create_wallet_transaction: z.boolean().optional()
})

const updateInputDto = z.object(entryFields).partial()

function monthLabel(year: number, month: number): string {
  return `${dayjs().month(month - 1).format('MMMM')} ${year}`
}

export const list = forge
  .query({
    description: 'List all payment entries',
    output: {
      OK: z.array(entryDto)
    }
  })
  .callback(async ({ db, response }) => {
    const rows = await db
      .select()
      .from(rentalPaymentEntries)
      .orderBy(desc(rentalPaymentEntries.year), desc(rentalPaymentEntries.month))

    return response.ok(rows)
  })

export const getById = forge
  .query({
    description: 'Get entry by ID',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), rentalPaymentEntries)
      })
    },
    output: {
      OK: entryDto
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    const row = (await db.query.entries.findFirst({ where: { id } }))!

    return response.ok(row)
  })

export const create = forge
  .mutation({
    description: 'Create a new payment entry',
    input: {
      body: createInputDto
    },
    media: {
      meter_reading_image: {
        optional: true
      },
      bank_statement: {
        optional: true
      }
    },
    output: {
      CREATED: entryDto
    }
  })
  .callback(
    async ({
      db,
      body,
      media: { meter_reading_image: rawMeter, bank_statement: rawStatement },
      core: {
        media: { convertPDFToImage },
        storage,
        validation: { checkModulesAvailability }
      },
      response
    }) => {
      const values: typeof rentalPaymentEntries.$inferInsert = {
        month: body.month,
        year: body.year,
        previous_meter_reading: body.previous_meter_reading,
        current_meter_reading: body.current_meter_reading,
        electricity_used: body.electricity_used,
        electricity_rate: body.electricity_rate,
        utility_bill: body.utility_bill,
        rental_fee: body.rental_fee,
        amount_paid: body.amount_paid,
        wallet_entry_id: body.wallet_entry_id ?? ''
      }

      if (rawMeter && typeof rawMeter !== 'string') {
        const ref = await storage.save({ file: rawMeter })

        values.meter_reading_image = ref?.key ?? ''
      }

      if (rawStatement && typeof rawStatement !== 'string') {
        if (rawStatement.originalName.endsWith('.pdf')) {
          const image = await convertPDFToImage(rawStatement.path)

          if (image) {
            const ref = await storage.save({
              file: {
                buffer: Buffer.from(await image.arrayBuffer()),
                originalName: image.name,
                mimeType: image.type
              }
            })

            values.bank_statement = ref?.key ?? ''
          }
        } else {
          const ref = await storage.save({ file: rawStatement })

          values.bank_statement = ref?.key ?? ''
        }
      }

      const [baseEntry] = await db
        .insert(rentalPaymentEntries)
        .values(values)
        .returning()

      const settings = await db.query.settings.findFirst()

      if (
        !settings ||
        !body.auto_create_wallet_transaction ||
        !settings.link_with_wallet ||
        !settings.wallet_template_id
      ) {
        return response.created(baseEntry)
      }

      const walletAvailable = await checkModulesAvailability(
        'lifeforge--wallet'
      )

      if (!walletAvailable) {
        return response.created(baseEntry)
      }

      const template = await getWalletTemplate(db, settings.wallet_template_id)

      if (!template) {
        return response.created(baseEntry)
      }

      const walletId = await createWalletTransaction(db, {
        amount: body.amount_paid,
        date: new Date(body.year, body.month - 1, 1),
        particulars: `Rental Payment - ${monthLabel(body.year, body.month)}`,
        template
      })

      const [linkedEntry] = await db
        .update(rentalPaymentEntries)
        .set({ wallet_entry_id: walletId, amount_paid: 0 })
        .where(eq(rentalPaymentEntries.id, baseEntry.id))
        .returning()

      return response.created(linkedEntry)
    }
  )

export const update = forge
  .mutation({
    description: 'Update an existing entry',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), rentalPaymentEntries)
      }),
      body: updateInputDto
    },
    media: {
      meter_reading_image: {
        optional: true
      },
      bank_statement: {
        optional: true
      }
    },
    output: {
      OK: entryDto
    }
  })
  .callback(
    async ({
      db,
      query: { id },
      body,
      media: { meter_reading_image: rawMeter, bank_statement: rawStatement },
      core: {
        media: { convertPDFToImage },
        storage
      },
      response
    }) => {
      const currentEntry = (await db.query.entries.findFirst({
        where: { id }
      }))!

      const set: Partial<typeof rentalPaymentEntries.$inferInsert> = {
        ...body,
        updated: new Date()
      }

      if (rawMeter === 'removed') {
        set.meter_reading_image = ''
      } else if (rawMeter && typeof rawMeter !== 'string') {
        const ref = await storage.save({ file: rawMeter })

        set.meter_reading_image = ref?.key ?? ''
      }

      if (rawStatement === 'removed') {
        set.bank_statement = ''
      } else if (rawStatement && typeof rawStatement !== 'string') {
        if (rawStatement.originalName.endsWith('.pdf')) {
          const image = await convertPDFToImage(rawStatement.path)

          if (image) {
            const ref = await storage.save({
              file: {
                buffer: Buffer.from(await image.arrayBuffer()),
                originalName: image.name,
                mimeType: image.type
              }
            })

            set.bank_statement = ref?.key ?? ''
          }
        } else {
          const ref = await storage.save({ file: rawStatement })

          set.bank_statement = ref?.key ?? ''
        }
      }

      const [updatedEntry] = await db
        .update(rentalPaymentEntries)
        .set(set)
        .where(eq(rentalPaymentEntries.id, id))
        .returning()

      if (currentEntry.wallet_entry_id && (body.year || body.month)) {
        const newYear = body.year ?? currentEntry.year

        const newMonth = body.month ?? currentEntry.month

        if (newYear !== currentEntry.year || newMonth !== currentEntry.month) {
          try {
            await updateWalletTransactionSchedule(
              db,
              currentEntry.wallet_entry_id,
              new Date(newYear, newMonth - 1, 1),
              `Rental Payment - ${monthLabel(newYear, newMonth)}`
            )
          } catch {
            // Wallet module unavailable or transaction missing — ignore.
          }
        }
      }

      return response.ok(updatedEntry)
    }
  )

export const linkWalletTransaction = forge
  .mutation({
    description: 'Link a wallet transaction to a rental payment entry',
    input: {
      body: z.object({
        entryId: forge.existsIn(z.string(), rentalPaymentEntries),
        transactionId: z.string()
      })
    },
    output: {
      OK: entryDto
    }
  })
  .callback(
    async ({
      db,
      body: { entryId, transactionId },
      core: {
        validation: { checkModulesAvailability }
      },
      response
    }) => {
      const walletAvailable = await checkModulesAvailability(
        'lifeforge--wallet'
      )

      if (!walletAvailable) {
        return response.badRequest('Wallet module is not available')
      }

      const walletTransaction = await getWalletTransaction(db, transactionId)

      if (!walletTransaction) {
        return response.badRequest('Wallet transaction not found')
      }

      const conflictingEntries = await db
        .select({ id: rentalPaymentEntries.id })
        .from(rentalPaymentEntries)
        .where(
          and(
            eq(rentalPaymentEntries.wallet_entry_id, transactionId),
            ne(rentalPaymentEntries.id, entryId)
          )
        )

      if (conflictingEntries.length > 0) {
        return response.conflict()
      }

      const [updated] = await db
        .update(rentalPaymentEntries)
        .set({ wallet_entry_id: transactionId, amount_paid: 0, updated: new Date() })
        .where(eq(rentalPaymentEntries.id, entryId))
        .returning()

      return response.ok(updated)
    }
  )

export const unlinkWalletTransaction = forge
  .mutation({
    description: 'Unlink a wallet transaction from a rental payment entry',
    input: {
      body: z.object({
        entryId: forge.existsIn(z.string(), rentalPaymentEntries)
      })
    },
    output: {
      OK: entryDto
    }
  })
  .callback(async ({ db, body: { entryId }, response }) => {
    const entry = (await db.query.entries.findFirst({
      where: { id: entryId }
    }))!

    if (!entry.wallet_entry_id) {
      return response.badRequest('No wallet transaction linked to this entry')
    }

    const walletTransaction = await getWalletTransaction(
      db,
      entry.wallet_entry_id
    ).catch(() => null)

    const amountToRestore = walletTransaction?.amount ?? 0

    const [updated] = await db
      .update(rentalPaymentEntries)
      .set({
        wallet_entry_id: '',
        amount_paid: amountToRestore,
        updated: new Date()
      })
      .where(eq(rentalPaymentEntries.id, entryId))
      .returning()

    return response.ok(updated)
  })

export const cleanupOrphanedWalletLinks = forge
  .mutation({
    description:
      'Clean up rental payment entries that are linked to deleted wallet transactions',
    output: {
      OK: z.object({
        cleanedCount: z.number(),
        entries: z.array(z.string())
      })
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
        return response.ok({ cleanedCount: 0, entries: [] })
      }

      const entriesWithWallet = await db
        .select()
        .from(rentalPaymentEntries)
        .where(ne(rentalPaymentEntries.wallet_entry_id, ''))

      const cleanedEntries: string[] = []

      for (const entry of entriesWithWallet) {
        const transaction = await getWalletTransaction(
          db,
          entry.wallet_entry_id
        ).catch(() => null)

        if (!transaction) {
          await db
            .update(rentalPaymentEntries)
            .set({ wallet_entry_id: '' })
            .where(eq(rentalPaymentEntries.id, entry.id))

          cleanedEntries.push(entry.id)
        }
      }

      return response.ok({
        cleanedCount: cleanedEntries.length,
        entries: cleanedEntries
      })
    }
  )

export const remove = forge
  .mutation({
    description: 'Delete an entry',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), rentalPaymentEntries)
      })
    },
    output: {
      NO_CONTENT: true
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    await db
      .delete(rentalPaymentEntries)
      .where(eq(rentalPaymentEntries.id, id))

    return response.noContent()
  })
