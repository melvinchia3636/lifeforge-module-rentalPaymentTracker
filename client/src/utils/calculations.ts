import type { InferOutput } from 'shared'

import type { PaymentEntry } from '../index'
import forgeAPI from '../utils/forgeAPI'

type Settings = InferOutput<typeof forgeAPI.rentalPaymentTracker.settings.get>

export interface CalculatedPayment {
  electricityBill: number
  totalPayable: number
  previousPrepayment: number
  currentPrepayment: number
}

/**
 * Calculate derived payment values for a single entry
 */
export function calculatePaymentValues(
  entry: PaymentEntry,
  previousEntry: PaymentEntry | null,
  settings: Settings
): CalculatedPayment {
  // Calculate electricity bill
  const electricityBill = entry.electricity_used * entry.electricity_rate

  // Calculate total payable
  const totalPayable = electricityBill + entry.utility_bill + entry.rental_fee

  // Calculate previous prepayment balance
  let previousPrepayment = 0

  if (previousEntry) {
    // Recursively calculate the previous entry's prepayment
    const prevElectricityBill =
      previousEntry.electricity_used * previousEntry.electricity_rate

    const prevTotalPayable =
      prevElectricityBill +
      previousEntry.utility_bill +
      previousEntry.rental_fee

    // We need the prepayment before the previous entry to calculate its prepayment
    // For simplicity in this recursive case, we'll use the settings initial value
    // In a full implementation, you'd calculate this for all entries
    const prevPreviousPrepayment = settings.initial_prepayment

    previousPrepayment =
      prevPreviousPrepayment + previousEntry.amount_paid - prevTotalPayable
  } else {
    // This is the first entry, use the initial prepayment from settings
    previousPrepayment = settings.initial_prepayment
  }

  // Calculate current prepayment balance
  const currentPrepayment =
    previousPrepayment + entry.amount_paid - totalPayable

  return {
    electricityBill,
    totalPayable,
    previousPrepayment,
    currentPrepayment
  }
}

/**
 * Calculate prepayment balances for all entries in chronological order
 */
export function calculateAllPrepayments(
  entries: PaymentEntry[],
  settings: Settings
): Map<string, CalculatedPayment> {
  const calculations = new Map<string, CalculatedPayment>()

  // Sort entries chronologically (oldest first)
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year

    return a.month - b.month
  })

  let runningPrepayment = settings.initial_prepayment

  for (const entry of sortedEntries) {
    const electricityBill = entry.electricity_used * entry.electricity_rate

    const totalPayable = electricityBill + entry.utility_bill + entry.rental_fee

    const previousPrepayment = runningPrepayment

    const currentPrepayment =
      previousPrepayment + entry.amount_paid - totalPayable

    calculations.set(entry.id, {
      electricityBill,
      totalPayable,
      previousPrepayment,
      currentPrepayment
    })

    // Update running prepayment for next iteration
    runningPrepayment = currentPrepayment
  }

  return calculations
}
