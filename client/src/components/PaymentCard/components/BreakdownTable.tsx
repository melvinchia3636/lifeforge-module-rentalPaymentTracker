import type { PaymentEntry } from '@'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { Trans, useTranslation } from 'react-i18next'
import { usePersonalization } from 'shared'

import type { CalculatedPayment } from '@/utils/calculations'

function BreakdownTable({
  entry,
  calculations: {
    electricityBill,
    totalPayable,
    previousPrepayment,
    currentPrepayment,
    amountPaid
  }
}: {
  entry: PaymentEntry
  calculations: CalculatedPayment
}) {
  const { t } = useTranslation('apps.melvinchia3636$rentalPaymentTracker')

  const { language } = usePersonalization()

  return (
    <table className="mt-4 w-full">
      <thead>
        <tr>
          <th className="text-bg-500 w-full py-3 text-left font-normal print:text-zinc-500" />
          <th className="text-bg-500 px-4 py-3 text-center font-medium print:text-zinc-500">
            RM
          </th>
        </tr>
      </thead>
      <tbody>
        {/* Total Payable Breakdown */}
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
            {t('paymentCard.baseRentalFee')}
          </td>
          <td className="text-bg-800 dark:text-bg-100 px-4 py-3 text-right font-medium">
            {entry.rental_fee.toFixed(2)}
          </td>
        </tr>
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
            {t('paymentCard.electricityBillPayable', {
              used: entry.electricity_used,
              rate: entry.electricity_rate.toFixed(2)
            })}
          </td>
          <td className="text-bg-800 dark:text-bg-100 px-4 py-3 text-right font-medium">
            {electricityBill.toFixed(2)}
          </td>
        </tr>
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
            {t('paymentCard.fixedUtilityBill')}
          </td>
          <td className="text-bg-800 dark:text-bg-100 px-4 py-3 text-right font-medium">
            {entry.utility_bill.toFixed(2)}
          </td>
        </tr>

        {/* Total Payable */}
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-800 dark:text-bg-100 px-4 py-3 font-semibold">
            {t('paymentCard.totalPayable')}:
          </td>
          <td className="text-custom-500 border-bg-200 dark:border-bg-700 border-t-[1.5px] text-right text-lg font-semibold print:border-zinc-300">
            <div className="border-bg-200 dark:border-bg-700 border-b-4 border-double px-4 py-3 print:border-zinc-300">
              {totalPayable.toFixed(2)}
            </div>
          </td>
        </tr>

        {/* Payment Reconciliation */}
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
            {t('paymentCard.paymentMade')}
          </td>
          <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
            {amountPaid.toFixed(2)}
          </td>
        </tr>
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
            <Trans
              i18nKey="paymentCard.lessTotalPayable"
              ns="apps.melvinchia3636$rentalPaymentTracker"
            />
          </td>
          <td className="text-bg-800 dark:text-bg-100 border-bg-200 dark:border-bg-700 border-b-[1.5px] px-4 py-3 text-right font-medium print:border-zinc-300">
            ({totalPayable.toFixed(2)})
          </td>
        </tr>

        {/* Excess/Shortfall */}
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-500 px-4 py-3 font-medium print:text-zinc-500">
            {t('paymentCard.paymentExcessShortfall')}:
          </td>
          <td
            className={clsx(
              'px-4 py-3 text-right font-medium',
              amountPaid - totalPayable >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {amountPaid - totalPayable >= 0
              ? (amountPaid - totalPayable).toFixed(2)
              : `(${(totalPayable - amountPaid).toFixed(2)})`}
          </td>
        </tr>
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
            {t('paymentCard.prepaymentCarriedDown', {
              month: dayjs()
                .month(entry.month - 2)
                .year(entry.month === 1 ? entry.year - 1 : entry.year)
                .locale(language)
                .format(language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY')
            })}
          </td>
          <td className="text-bg-800 dark:text-bg-100 px-4 py-3 text-right font-medium">
            {previousPrepayment.toFixed(2)}
          </td>
        </tr>

        {/* Final Prepayment */}
        <tr className="odd:bg-bg-200/30 dark:odd:bg-bg-800/30">
          <td className="text-bg-800 dark:text-bg-100 px-4 py-3 font-semibold">
            {t('paymentCard.prepaymentBroughtDown', {
              month: dayjs()
                .month(entry.month)
                .year(entry.month === 12 ? entry.year + 1 : entry.year)
                .locale(language)
                .format(language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY')
            })}
          </td>
          <td
            className={clsx(
              'border-bg-200 dark:border-bg-700 border-t-[1.5px] pt-3 text-right text-lg font-semibold print:border-zinc-300',
              currentPrepayment >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            <div className="border-bg-200 dark:border-bg-700 border-b-4 border-double px-4 pb-3 print:border-zinc-300">
              {currentPrepayment >= 0
                ? currentPrepayment.toFixed(2)
                : `(${Math.abs(currentPrepayment).toFixed(2)})`}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default BreakdownTable
