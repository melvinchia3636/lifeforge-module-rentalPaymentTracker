import { forgeController } from '@functions/routes'
import { SCHEMAS } from '@schema'
import z from 'zod'

export const list = forgeController
  .query()
  .description('List all entries')
  .input({})
  .callback(({ pb }) => pb.getFullList.collection('rental_payment_tracker__entries').execute())

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
  .description('Create a new entry')
  .input({
    body: SCHEMAS.rental_payment_tracker.entries.schema.omit({ created: true, updated: true })
  })
  .callback(({ pb, body }) =>
    pb.create.collection('rental_payment_tracker__entries').data(body).execute()
  )

export const update = forgeController
  .mutation()
  .description('Update an existing entry')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: SCHEMAS.rental_payment_tracker.entries.schema
      .partial()
      .omit({ created: true, updated: true })
  })
  .existenceCheck('query', {
    id: 'rental_payment_tracker__entries'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('rental_payment_tracker__entries').id(id).data(body).execute()
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
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('rental_payment_tracker__entries').id(id).execute()
  )
