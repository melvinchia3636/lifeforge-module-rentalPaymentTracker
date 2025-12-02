import { forgeController } from '@functions/routes'
import { ClientError } from '@functions/routes/utils/response'
import { checkModulesAvailability } from '@functions/utils/checkModulesAvailability'
import convertPDFToImage from '@functions/utils/convertPDFToImage'
import { SCHEMAS } from '@schema'
import fs from 'fs'
import moment from 'moment'
import z from 'zod'

export const list = forgeController
  .query()
  .description('List all payment entries')
  .input({})
  .callback(async ({ pb }) =>
    pb.getFullList
      .collection('rental_payment_tracker__entries')
      .sort(['-year', '-month'])
      .execute()
  )

export const getById = forgeController
  .query()
  .description('Get entry by ID')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'rental_payment_tracker__entries'
  })
  .callback(({ pb, query: { id } }) =>
    pb.getOne.collection('rental_payment_tracker__entries').id(id).execute()
  )

export const create = forgeController
  .mutation()
  .description('Create a new payment entry')
  .input({
    body: SCHEMAS.rental_payment_tracker.entries.schema
      .omit({
        created: true,
        updated: true,
        meter_reading_image: true,
        bank_statement: true
      })
      .extend({
        auto_create_wallet_transaction: z.boolean().optional()
      })
  })
  .media({
    meter_reading_image: {
      optional: true
    },
    bank_statement: {
      optional: true
    }
  })
  .statusCode(201)
  .callback(
    async ({
      pb,
      body,
      media: { meter_reading_image: rawMeter, bank_statement: rawStatement }
    }) => {
      // Handle meter reading image
      const meterReadingImage =
        rawMeter && typeof rawMeter !== 'string'
          ? new File([fs.readFileSync(rawMeter.path)], 'meter.jpg', {
              type: rawMeter.mimetype
            })
          : undefined

      // Handle bank statement (convert PDF if needed)
      const bankStatement =
        rawStatement && typeof rawStatement !== 'string'
          ? rawStatement.originalname.endsWith('.pdf')
            ? await convertPDFToImage(rawStatement.path)
            : new File([fs.readFileSync(rawStatement.path)], 'statement.jpg', {
                type: rawStatement.mimetype
              })
          : undefined

      const baseEntry = await pb.create
        .collection('rental_payment_tracker__entries')
        .data({
          ...body,
          meter_reading_image: meterReadingImage,
          bank_statement: bankStatement
        })
        .execute()

      const settings = await pb.getFullList
        .collection('rental_payment_tracker__settings')
        .execute()

      if (!settings.length) {
        throw new Error('Settings not found')
      }

      const settingsData = settings[0]

      const walletModuleAvailable = checkModulesAvailability('wallet')

      if (
        !settingsData.link_with_wallet ||
        !settingsData.wallet_template_id ||
        !walletModuleAvailable
      ) {
        return baseEntry
      }

      const walletTemplate = await pb.instance
        .collection('wallet__transaction_templates')
        .getOne(settingsData.wallet_template_id)
        .catch(() => null)

      if (!walletTemplate) {
        return baseEntry
      }

      const baseTransactionEntry = await pb.instance
        .collection('wallet__transactions')
        .create({
          date: moment()
            .year(body.year)
            .month(body.month - 1)
            .date(1)
            .toDate(),
          amount: body.amount_paid,
          type: 'income_expenses'
        })

      await pb.instance
        .collection('wallet__transactions_income_expenses')
        .create({
          base_transaction: baseTransactionEntry.id,
          type: 'expenses',
          particulars: `Rental Payment - ${moment()
            .month(body.month - 1)
            .format('MMMM')} ${body.year}`,
          asset: walletTemplate.asset,
          category: walletTemplate.category,
          ledgers: walletTemplate.ledgers,
          location_coords: walletTemplate.location_coords,
          location_name: walletTemplate.location_name
        })

      await pb.update
        .collection('rental_payment_tracker__entries')
        .id(baseEntry.id)
        .data({
          wallet_entry_id: baseTransactionEntry.id,
          amount_paid: 0
        })
        .execute()

      return baseEntry
    }
  )

export const update = forgeController
  .mutation()
  .description('Update an existing entry')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: SCHEMAS.rental_payment_tracker.entries.schema.partial().omit({
      created: true,
      updated: true,
      meter_reading_image: true,
      bank_statement: true
    })
  })
  .media({
    meter_reading_image: {
      optional: true
    },
    bank_statement: {
      optional: true
    }
  })
  .existenceCheck('query', {
    id: 'rental_payment_tracker__entries'
  })
  .callback(
    async ({
      pb,
      query: { id },
      body,
      media: { meter_reading_image: rawMeter, bank_statement: rawStatement }
    }) => {
      // Get the current entry to check if it has a linked wallet transaction
      const currentEntry = await pb.getOne
        .collection('rental_payment_tracker__entries')
        .id(id)
        .execute()

      // Handle meter reading image
      const meterReadingImage =
        rawMeter && typeof rawMeter !== 'string'
          ? new File([fs.readFileSync(rawMeter.path)], 'meter.jpg', {
              type: rawMeter.mimetype
            })
          : undefined

      // Handle bank statement (convert PDF if needed)
      const bankStatement =
        rawStatement && typeof rawStatement !== 'string'
          ? rawStatement.originalname.endsWith('.pdf')
            ? await convertPDFToImage(rawStatement.path)
            : new File([fs.readFileSync(rawStatement.path)], 'statement.jpg', {
                type: rawStatement.mimetype
              })
          : undefined

      const updatedEntry = await pb.update
        .collection('rental_payment_tracker__entries')
        .id(id)
        .data({
          ...body,
          ...(rawMeter !== 'keep' && {
            meter_reading_image:
              rawMeter === 'removed' ? null : meterReadingImage
          }),
          ...(rawStatement !== 'keep' && {
            bank_statement: rawStatement === 'removed' ? null : bankStatement
          })
        })
        .execute()

      // If wallet transaction is linked and year/month changed, update the wallet transaction
      if (currentEntry.wallet_entry_id && (body.year || body.month)) {
        const newYear = body.year ?? currentEntry.year

        const newMonth = body.month ?? currentEntry.month

        // Check if year or month actually changed
        if (newYear !== currentEntry.year || newMonth !== currentEntry.month) {
          try {
            // Update wallet transaction date
            await pb.instance
              .collection('wallet__transactions')
              .update(currentEntry.wallet_entry_id, {
                date: moment()
                  .year(newYear)
                  .month(newMonth - 1)
                  .date(1)
                  .toDate()
              })

            // Update wallet transaction particulars
            const incomeExpense = await pb.instance
              .collection('wallet__transactions_income_expenses')
              .getFirstListItem(
                `base_transaction = "${currentEntry.wallet_entry_id}"`
              )

            if (incomeExpense) {
              await pb.instance
                .collection('wallet__transactions_income_expenses')
                .update(incomeExpense.id, {
                  particulars: `Rental Payment - ${moment()
                    .month(newMonth - 1)
                    .format('MMMM')} ${newYear}`
                })
            }
          } catch {
            // If wallet transaction doesn't exist or update fails, ignore the error
          }
        }
      }

      return updatedEntry
    }
  )

export const linkWalletTransaction = forgeController
  .mutation()
  .description('Link a wallet transaction to a rental payment entry')
  .input({
    body: z.object({
      entryId: z.string(),
      transactionId: z.string()
    })
  })
  .existenceCheck('body', {
    entryId: 'rental_payment_tracker__entries',
    transactionId: 'wallet__transactions' as any
  })
  .callback(async ({ pb, body: { entryId, transactionId } }) => {
    // Check if this wallet transaction is already linked to another entry
    const existingEntries = await pb.getFullList
      .collection('rental_payment_tracker__entries')
      .filter([
        {
          field: 'wallet_entry_id',
          operator: '=',
          value: transactionId
        },
        {
          field: 'id',
          operator: '!=',
          value: entryId
        }
      ])
      .execute()

    if (existingEntries.length > 0) {
      throw new ClientError(
        'This wallet transaction is already linked to another payment entry'
      )
    }

    // When linking a wallet transaction, the wallet entry becomes the source of truth
    // Set amount_paid to 0 as we'll use the wallet transaction amount directly
    return await pb.update
      .collection('rental_payment_tracker__entries')
      .id(entryId)
      .data({
        wallet_entry_id: transactionId,
        amount_paid: 0
      })
      .execute()
  })

export const unlinkWalletTransaction = forgeController
  .mutation()
  .description('Unlink a wallet transaction from a rental payment entry')
  .input({
    body: z.object({
      entryId: z.string()
    })
  })
  .existenceCheck('body', {
    entryId: 'rental_payment_tracker__entries'
  })
  .callback(async ({ pb, body: { entryId } }) => {
    // Get the current entry to find the linked wallet transaction
    const entry = await pb.getOne
      .collection('rental_payment_tracker__entries')
      .id(entryId)
      .execute()

    if (!entry.wallet_entry_id) {
      throw new Error('No wallet transaction linked to this entry')
    }

    // Get the wallet transaction amount to restore it to the entry
    const walletTransaction = await pb.instance
      .collection('wallet__transactions')
      .getOne(entry.wallet_entry_id)
      .catch(() => null)

    const amountToRestore = walletTransaction?.amount ?? 0

    // Unlink by clearing wallet_entry_id and restoring the amount
    return await pb.update
      .collection('rental_payment_tracker__entries')
      .id(entryId)
      .data({
        wallet_entry_id: '',
        amount_paid: amountToRestore
      })
      .execute()
  })

export const cleanupOrphanedWalletLinks = forgeController
  .mutation()
  .description(
    'Clean up rental payment entries that are linked to deleted wallet transactions'
  )
  .input({})
  .callback(async ({ pb }) => {
    const walletModuleAvailable = checkModulesAvailability('wallet')

    if (!walletModuleAvailable) {
      return { cleanedCount: 0, entries: [] }
    }

    // Get all entries that have a wallet_entry_id
    const entriesWithWallet = await pb.getFullList
      .collection('rental_payment_tracker__entries')
      .filter([{ field: 'wallet_entry_id', operator: '!=', value: '' }])
      .execute()

    const cleanedEntries: string[] = []

    // Check each linked wallet transaction
    for (const entry of entriesWithWallet) {
      try {
        // Try to fetch the wallet transaction
        await pb.instance
          .collection('wallet__transactions')
          .getOne(entry.wallet_entry_id)
      } catch {
        // If wallet transaction doesn't exist, clear the link
        await pb.update
          .collection('rental_payment_tracker__entries')
          .id(entry.id)
          .data({
            wallet_entry_id: ''
          })
          .execute()

        cleanedEntries.push(entry.id)
      }
    }

    return {
      cleanedCount: cleanedEntries.length,
      entries: cleanedEntries
    }
  })

export const remove = forgeController
  .mutation()
  .description('Delete an entry')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'rental_payment_tracker__entries'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('rental_payment_tracker__entries').id(id).execute()
  )
