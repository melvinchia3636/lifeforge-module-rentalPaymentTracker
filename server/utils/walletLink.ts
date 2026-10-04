import { sql } from 'drizzle-orm'

import type { BuiltModuleSchema } from '@lifeforge/drizzle'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import type { RentalPaymentTrackerSchema } from '../forge'

/**
 * The rental tracker reaches into the wallet module's tables directly.
 *
 * This is a stop-gap: there is no official cross-module API yet, so we run raw
 * SQL against the wallet module's namespaced tables (`wallet__*`) through the
 * shared Postgres connection. The schema is intentionally not duplicated here.
 */
export type RentalDb = PostgresJsDatabase<
  BuiltModuleSchema<RentalPaymentTrackerSchema>
>

export interface WalletTemplate {
  asset: string | null
  category: string | null
  ledgers: string[] | null
  location_name: string | null
  location_coords: { lat: number; lon: number } | null
}

export interface WalletTemplateView {
  id: string
  name: string
  type: 'expenses'
  amount: number
  particulars: string
  asset: string | null
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
  ledgers: string[]
  location_name: string
  location_coords: { lat: number; lon: number } | null
}

async function execute<T>(
  db: RentalDb,
  query: Parameters<RentalDb['execute']>[0]
): Promise<T[]> {
  return (await db.execute(query)) as unknown as T[]
}

export async function getWalletTemplates(
  db: RentalDb
): Promise<WalletTemplateView[]> {
  const rows = await execute<{
    id: string
    name: string
    type: string
    amount: number
    particulars: string
    asset: string | null
    category: string | null
    ledgers: string[] | null
    location_name: string | null
    location_coords: { lat: number; lon: number } | null
    category_name: string | null
    category_icon: string | null
    category_color: string | null
  }>(
    db,
    sql`
      SELECT
        t.id,
        t.name,
        t.type,
        t.amount,
        t.particulars,
        t.asset,
        t.category,
        t.ledgers,
        t.location_name,
        t.location_coords,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color
      FROM wallet__transaction_templates t
      LEFT JOIN wallet__categories c ON c.id = t.category
      WHERE t.type = 'expenses'
      ORDER BY t.name
    `
  )

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    type: 'expenses' as const,
    amount: row.amount,
    particulars: row.particulars,
    asset: row.asset,
    category: {
      id: row.category ?? '',
      name: row.category_name ?? '',
      icon: row.category_icon ?? '',
      color: row.category_color ?? ''
    },
    ledgers: row.ledgers ?? [],
    location_name: row.location_name ?? '',
    location_coords: row.location_coords
  }))
}

export async function getWalletTemplate(
  db: RentalDb,
  id: string
): Promise<WalletTemplate | null> {
  const rows = await execute<WalletTemplate>(
    db,
    sql`
      SELECT asset, category, ledgers, location_name, location_coords
      FROM wallet__transaction_templates
      WHERE id = ${id}
      LIMIT 1
    `
  )

  return rows[0] ?? null
}

export async function getWalletTransaction(
  db: RentalDb,
  id: string
): Promise<{ id: string; amount: number } | null> {
  const rows = await execute<{ id: string; amount: number }>(
    db,
    sql`
      SELECT id, amount
      FROM wallet__transactions
      WHERE id = ${id}
      LIMIT 1
    `
  )

  return rows[0] ?? null
}

export async function createWalletTransaction(
  db: RentalDb,
  params: {
    amount: number
    date: Date
    particulars: string
    template: WalletTemplate
  }
): Promise<string> {
  const { amount, date, particulars, template } = params

  const [transaction] = await execute<{ id: string }>(
    db,
    sql`
      INSERT INTO wallet__transactions (type, amount, date, receipt)
      VALUES ('income_expenses', ${amount}, ${date}, '')
      RETURNING id
    `
  )

  await execute(
    db,
    sql`
      INSERT INTO wallet__transactions_income_expenses (
        base_transaction,
        type,
        particulars,
        asset,
        category,
        ledgers,
        location_name,
        location_coords
      )
      VALUES (
        ${transaction.id},
        'expenses',
        ${particulars},
        ${template.asset},
        ${template.category},
        ${JSON.stringify(template.ledgers ?? [])}::jsonb,
        ${template.location_name ?? ''},
        ${template.location_coords ? JSON.stringify(template.location_coords) : null}::jsonb
      )
    `
  )

  return transaction.id
}

export async function updateWalletTransactionSchedule(
  db: RentalDb,
  id: string,
  date: Date,
  particulars: string
): Promise<void> {
  await execute(
    db,
    sql`
      UPDATE wallet__transactions
      SET date = ${date}, updated = now()
      WHERE id = ${id}
    `
  )

  await execute(
    db,
    sql`
      UPDATE wallet__transactions_income_expenses
      SET particulars = ${particulars}
      WHERE base_transaction = ${id}
    `
  )
}
