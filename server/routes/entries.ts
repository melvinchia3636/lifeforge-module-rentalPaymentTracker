import { forgeController } from '@functions/routes'
import convertPDFToImage from '@functions/utils/convertPDFToImage'
import { SCHEMAS } from '@schema'
import fs from 'fs'
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
    body: SCHEMAS.rental_payment_tracker.entries.schema.omit({
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

      return await pb.create
        .collection('rental_payment_tracker__entries')
        .data({
          ...body,
          meter_reading_image: meterReadingImage,
          bank_statement: bankStatement
        })
        .execute()
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

      return await pb.update
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
    }
  )

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
