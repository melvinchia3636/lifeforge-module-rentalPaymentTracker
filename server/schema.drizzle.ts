import { type RelationsBuilder } from 'drizzle-orm'
import {
  boolean,
  doublePrecision,
  integer,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

import { createModuleTable } from '@lifeforge/drizzle'

const pgTable = createModuleTable()

export const rentalPaymentEntries = pgTable('entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  month: integer('month').notNull().default(1),
  year: integer('year').notNull().default(2000),
  previous_meter_reading: doublePrecision('previous_meter_reading')
    .notNull()
    .default(0),
  current_meter_reading: doublePrecision('current_meter_reading')
    .notNull()
    .default(0),
  electricity_used: doublePrecision('electricity_used').notNull().default(0),
  electricity_rate: doublePrecision('electricity_rate').notNull().default(0),
  utility_bill: doublePrecision('utility_bill').notNull().default(0),
  rental_fee: doublePrecision('rental_fee').notNull().default(0),
  meter_reading_image: text('meter_reading_image').notNull().default(''),
  bank_statement: text('bank_statement').notNull().default(''),
  amount_paid: doublePrecision('amount_paid').notNull().default(0),
  wallet_entry_id: text('wallet_entry_id').notNull().default(''),
  created: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
  updated: timestamp('updated', { mode: 'date' }).defaultNow().notNull()
})

export const rentalPaymentSettings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  initial_prepayment: doublePrecision('initial_prepayment').notNull().default(0),
  initial_meter_reading: doublePrecision('initial_meter_reading')
    .notNull()
    .default(0),
  electricity_rate: doublePrecision('electricity_rate').notNull().default(0),
  utility_bill: doublePrecision('utility_bill').notNull().default(0),
  rental_fee: doublePrecision('rental_fee').notNull().default(0),
  link_with_wallet: boolean('link_with_wallet').notNull().default(false),
  wallet_template_id: text('wallet_template_id').notNull().default('')
})

export const tables = {
  entries: rentalPaymentEntries,
  settings: rentalPaymentSettings
}

export const relations = (_r: RelationsBuilder<typeof tables>) => ({})
