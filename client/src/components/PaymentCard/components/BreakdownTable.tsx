import type { PaymentEntry } from '@'
import dayjs from 'dayjs'
import { Trans } from 'react-i18next'

import { useModuleTranslation } from '@lifeforge/localization'
import { usePersonalization } from '@lifeforge/ui'

import type { CalculatedPayment } from '@/utils/calculations'

import * as styles from './BreakdownTable.css'

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
  const { t } = useModuleTranslation()
  const { language } = usePersonalization()

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.header} style={{ width: '100%' }} />
          <th className={styles.header}>RM</th>
        </tr>
      </thead>
      <tbody>
        <tr className={styles.row}>
          <td className={styles.label}>{t('paymentCard.baseRentalFee')}</td>
          <td className={styles.value}>{entry.rental_fee.toFixed(2)}</td>
        </tr>
        <tr className={styles.row}>
          <td className={styles.label}>
            {t('paymentCard.electricityBillPayable', {
              used: entry.electricity_used,
              rate: entry.electricity_rate.toFixed(2)
            })}
          </td>
          <td className={styles.value}>{electricityBill.toFixed(2)}</td>
        </tr>
        <tr className={styles.row}>
          <td className={styles.label}>{t('paymentCard.fixedUtilityBill')}</td>
          <td className={styles.value}>{entry.utility_bill.toFixed(2)}</td>
        </tr>

        <tr className={styles.row}>
          <td className={styles.label}>
            <span style={{ fontWeight: 600 }}>
              {t('paymentCard.totalPayable')}:
            </span>
          </td>
          <td className={styles.totalValue}>
            <div className={styles.totalDivider}>{totalPayable.toFixed(2)}</div>
          </td>
        </tr>

        <tr className={styles.row}>
          <td className={styles.label}>{t('paymentCard.paymentMade')}</td>
          <td className={`${styles.green} ${styles.value}`}>
            {amountPaid.toFixed(2)}
          </td>
        </tr>
        <tr className={styles.row}>
          <td className={styles.label}>
            <Trans
              i18nKey="paymentCard.lessTotalPayable"
              ns="apps.melvinchia3636--rental-payment-tracker"
            />
          </td>
          <td className={`${styles.value} ${styles.borderBottom}`}>
            ({totalPayable.toFixed(2)})
          </td>
        </tr>

        <tr className={styles.row}>
          <td className={styles.label}>
            <span style={{ fontWeight: 600 }}>
              {t('paymentCard.paymentExcessShortfall')}:
            </span>
          </td>
          <td
            className={`${styles.value} ${amountPaid - totalPayable >= 0 ? styles.green : styles.red}`}
          >
            {amountPaid - totalPayable >= 0
              ? (amountPaid - totalPayable).toFixed(2)
              : `(${(totalPayable - amountPaid).toFixed(2)})`}
          </td>
        </tr>
        <tr className={styles.row}>
          <td className={styles.label}>
            {t('paymentCard.prepaymentCarriedDown', {
              month: dayjs()
                .month(entry.month - 2)
                .year(entry.month === 1 ? entry.year - 1 : entry.year)
                .locale(language)
                .format(language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY')
            })}
          </td>
          <td className={styles.value}>{previousPrepayment.toFixed(2)}</td>
        </tr>

        <tr className={styles.row}>
          <td className={styles.label}>
            <span style={{ fontWeight: 600 }}>
              {t('paymentCard.prepaymentBroughtDown', {
                month: dayjs()
                  .month(entry.month)
                  .year(entry.month === 12 ? entry.year + 1 : entry.year)
                  .locale(language)
                  .format(language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY')
              })}
            </span>
          </td>
          <td className={styles.totalValue}>
            <div className={styles.totalDivider}>
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
