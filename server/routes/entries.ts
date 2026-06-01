import dayjs from 'dayjs'
import fs from 'fs'
import z from 'zod'

import forge from '../forge'
import schemas from '../schema'

export const list = forge
  .query({
    description: 'List all payment entries',
    output: {
      OK: z.array(schemas.entries)
    }
  })
  .callback(async ({ pb, response }) =>
    response.ok(
      await pb.getFullList
        .collection('entries')
        .sort(['-year', '-month'])
        .execute()
    )
  )

export const getById = forge
  .query({
    description: 'Get entry by ID',
    input: {
      query: z.object({
        id: z.string()
      })
    },
    existenceCheck: {
      query: { id: 'entries' }
    },
    output: {
      OK: schemas.entries,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, response }) =>
    response.ok(await pb.getOne.collection('entries').id(id).execute())
  )

export const create = forge
  .mutation({
    description: 'Create a new payment entry',
    input: {
      body: schemas.entries
        .omit({
          created: true,
          updated: true,
          meter_reading_image: true,
          bank_statement: true
        })
        .extend({
          auto_create_wallet_transaction: z.boolean().optional()
        })
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
      CREATED: schemas.entries
    }
  })
  .callback(
    async ({
      pb,
      body,
      media: { meter_reading_image: rawMeter, bank_statement: rawStatement },
      core: {
        media: { convertPDFToImage },
        validation: { checkModulesAvailability }
      },
      response
    }) => {
      const meterReadingImage =
        rawMeter && typeof rawMeter !== 'string'
          ? new File([fs.readFileSync(rawMeter.path)], 'meter.jpg', {
              type: rawMeter.mimetype
            })
          : undefined

      const bankStatement =
        rawStatement && typeof rawStatement !== 'string'
          ? rawStatement.originalname.endsWith('.pdf')
            ? await convertPDFToImage(rawStatement.path)
            : new File([fs.readFileSync(rawStatement.path)], 'statement.jpg', {
                type: rawStatement.mimetype
              })
          : undefined

      const baseEntry = await pb.create
        .collection('entries')
        .data({
          ...body,
          meter_reading_image: meterReadingImage,
          bank_statement: bankStatement
        })
        .execute()

      const settings = await pb.getFullList.collection('settings').execute()

      if (!settings.length) {
        return response.created(baseEntry)
      }

      const settingsData = settings[0]

      const walletModuleAvailable = checkModulesAvailability('wallet')

      if (
        !body.auto_create_wallet_transaction ||
        !settingsData.link_with_wallet ||
        !settingsData.wallet_template_id ||
        !walletModuleAvailable
      ) {
        return response.created(baseEntry)
      }

      const walletTemplate = await pb.instance
        .collection('transaction_templates')
        .getOne(settingsData.wallet_template_id)
        .catch(() => null)

      if (!walletTemplate) {
        return response.created(baseEntry)
      }

      const baseTransactionEntry = await pb.instance
        .collection('wallet__transactions')
        .create({
          date: dayjs()
            .year(body.year)
            .month(body.month - 1)
            .date(1)
            .toDate(),
          amount: body.amount_paid,
          type: 'income_expenses'
        })

      await pb.instance.collection('transactions_income_expenses').create({
        base_transaction: baseTransactionEntry.id,
        type: 'expenses',
        particulars: `Rental Payment - ${dayjs()
          .month(body.month - 1)
          .format('MMMM')} ${body.year}`,
        asset: walletTemplate.asset,
        category: walletTemplate.category,
        ledgers: walletTemplate.ledgers,
        location_coords: walletTemplate.location_coords,
        location_name: walletTemplate.location_name
      })

      await pb.update
        .collection('entries')
        .id(baseEntry.id)
        .data({
          wallet_entry_id: baseTransactionEntry.id,
          amount_paid: 0
        })
        .execute()

      return response.created(baseEntry)
    }
  )

export const update = forge
  .mutation({
    description: 'Update an existing entry',
    input: {
      query: z.object({
        id: z.string()
      }),
      body: schemas.entries.partial().omit({
        created: true,
        updated: true,
        meter_reading_image: true,
        bank_statement: true
      })
    },
    media: {
      meter_reading_image: {
        optional: true
      },
      bank_statement: {
        optional: true
      }
    },
    existenceCheck: {
      query: { id: 'entries' }
    },
    output: {
      OK: schemas.entries,
      NOT_FOUND: true
    }
  })
  .callback(
    async ({
      pb,
      query: { id },
      body,
      media: { meter_reading_image: rawMeter, bank_statement: rawStatement },
      core: {
        media: { convertPDFToImage }
      },
      response
    }) => {
      const currentEntry = await pb.getOne
        .collection('entries')
        .id(id)
        .execute()

      const meterReadingImage =
        rawMeter && typeof rawMeter !== 'string'
          ? new File([fs.readFileSync(rawMeter.path)], 'meter.jpg', {
              type: rawMeter.mimetype
            })
          : undefined

      const bankStatement =
        rawStatement && typeof rawStatement !== 'string'
          ? rawStatement.originalname.endsWith('.pdf')
            ? await convertPDFToImage(rawStatement.path)
            : new File([fs.readFileSync(rawStatement.path)], 'statement.jpg', {
                type: rawStatement.mimetype
              })
          : undefined

      const updatedEntry = await pb.update
        .collection('entries')
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

      if (currentEntry.wallet_entry_id && (body.year || body.month)) {
        const newYear = body.year ?? currentEntry.year

        const newMonth = body.month ?? currentEntry.month

        if (newYear !== currentEntry.year || newMonth !== currentEntry.month) {
          try {
            await pb.instance
              .collection('wallet__transactions')
              .update(currentEntry.wallet_entry_id, {
                date: dayjs()
                  .year(newYear)
                  .month(newMonth - 1)
                  .date(1)
                  .toDate()
              })

            const incomeExpense = await pb.instance
              .collection('wallet__transactions_income_expenses')
              .getFirstListItem(
                `base_transaction = "${currentEntry.wallet_entry_id}"`
              )

            if (incomeExpense) {
              await pb.instance
                .collection('wallet__transactions_income_expenses')
                .update(incomeExpense.id, {
                  particulars: `Rental Payment - ${dayjs()
                    .month(newMonth - 1)
                    .format('MMMM')} ${newYear}`
                })
            }
          } catch {}
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
        entryId: z.string(),
        transactionId: z.string()
      })
    },
    existenceCheck: {
      body: {
        entryId: 'entries'
      }
    },
    output: {
      OK: schemas.entries,
      CONFLICT: true,
      BAD_REQUEST: z.string(),
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, body: { entryId, transactionId }, response }) => {
    const walletTransaction = await pb.instance
      .collection('wallet__transactions')
      .getOne(transactionId)
      .catch(() => null)

    if (!walletTransaction) {
      return response.badRequest('Wallet transaction not found')
    }

    const existingEntries = await pb.getFullList
      .collection('entries')
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
      return response.conflict()
    }

    return response.ok(
      await pb.update
        .collection('entries')
        .id(entryId)
        .data({
          wallet_entry_id: transactionId,
          amount_paid: 0
        })
        .execute()
    )
  })

export const unlinkWalletTransaction = forge
  .mutation({
    description: 'Unlink a wallet transaction from a rental payment entry',
    input: {
      body: z.object({
        entryId: z.string()
      })
    },
    existenceCheck: {
      body: { entryId: 'entries' }
    },
    output: {
      OK: schemas.entries,
      BAD_REQUEST: z.string(),
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, body: { entryId }, response }) => {
    const entry = await pb.getOne.collection('entries').id(entryId).execute()

    if (!entry.wallet_entry_id) {
      return response.badRequest('No wallet transaction linked to this entry')
    }

    const walletTransaction = await pb.instance
      .collection('wallet__transactions')
      .getOne(entry.wallet_entry_id)
      .catch(() => null)

    const amountToRestore = walletTransaction?.amount ?? 0

    return response.ok(
      await pb.update
        .collection('entries')
        .id(entryId)
        .data({
          wallet_entry_id: '',
          amount_paid: amountToRestore
        })
        .execute()
    )
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
      pb,
      core: {
        validation: { checkModulesAvailability }
      },
      response
    }) => {
      const walletModuleAvailable = checkModulesAvailability('wallet')

      if (!walletModuleAvailable) {
        return response.ok({ cleanedCount: 0, entries: [] })
      }

      const entriesWithWallet = await pb.getFullList
        .collection('entries')
        .filter([{ field: 'wallet_entry_id', operator: '!=', value: '' }])
        .execute()

      const cleanedEntries: string[] = []

      for (const entry of entriesWithWallet) {
        try {
          await pb.instance
            .collection('wallet__transactions')
            .getOne(entry.wallet_entry_id)
        } catch {
          await pb.update
            .collection('entries')
            .id(entry.id)
            .data({
              wallet_entry_id: ''
            })
            .execute()

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
        id: z.string()
      })
    },
    existenceCheck: {
      query: { id: 'entries' }
    },
    output: {
      NO_CONTENT: true,
      NOT_FOUND: true
    }
  })
  .callback(async ({ pb, query: { id }, response }) => {
    await pb.delete.collection('entries').id(id).execute()

    return response.noContent()
  })
