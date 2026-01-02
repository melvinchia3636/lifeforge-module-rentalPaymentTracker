import type { PaymentEntry } from '@'
import { Icon } from '@iconify/react'
import { Card } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'

function MeterReadingCard({ entry }: { entry: PaymentEntry }) {
  const { t } = useTranslation('apps.rentalPaymentTracker')

  return (
    <Card className="component-bg-lighter print:bg-zinc-100">
      <p className="text-bg-500 mb-2 flex items-center gap-2 font-medium tracking-wider uppercase print:text-[12px] print:text-zinc-500">
        <Icon className="size-5" icon="tabler:gauge" />
        {t('paymentCard.meterReading')}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-bg-600 dark:text-bg-400">
          {t('paymentCard.last')}
        </span>
        <span className="text-bg-800 dark:text-bg-100 font-semibold">
          {entry.previous_meter_reading} kWh
        </span>
        <Icon className="text-bg-400" icon="tabler:arrow-right" />
        <span className="text-bg-600 dark:text-bg-400">
          {t('paymentCard.this')}
        </span>
        <span className="text-bg-800 dark:text-bg-100 font-semibold">
          {entry.current_meter_reading} kWh
        </span>
      </div>
      <p className="text-custom-500 mt-1">
        {t('paymentCard.totalUsed')}:{' '}
        <span className="font-semibold">{entry.electricity_used} kWh</span>
      </p>
    </Card>
  )
}

export default MeterReadingCard
