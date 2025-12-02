import dayjs from 'dayjs'
import { Card } from 'lifeforge-ui'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePersonalization } from 'shared'

import type { PaymentEntry } from '../../index'
import type { CalculatedPayment } from '../../utils/calculations'
import DetailsSection from './components/DetailsSection'
import Header from './components/Header'

interface PaymentCardProps {
  entry: PaymentEntry
  calculations: CalculatedPayment
}

export default function PaymentCard({ entry, calculations }: PaymentCardProps) {
  const { t } = useTranslation('apps.rentalPaymentTracker')

  const ref = useRef<HTMLDivElement>(null)

  const { language } = usePersonalization()

  const [breakdownCollapsed, setBreakdownCollapsed] = useState(true)

  return (
    <Card
      ref={ref}
      className="flex flex-col overflow-hidden p-0! print:aspect-[1/1.414] print:w-full print:bg-white print:p-8! print:p-12 print:font-[Onest]"
    >
      <Header
        breakdownCollapsed={breakdownCollapsed}
        calculations={calculations}
        entry={entry}
        setBreakdownCollapsed={setBreakdownCollapsed}
      />
      <DetailsSection
        calculations={calculations}
        collapsed={breakdownCollapsed}
        containerRef={ref}
        entry={entry}
        setCollapsed={setBreakdownCollapsed}
      />
      <footer className="text-bg-500 mt-auto hidden w-full items-center justify-between text-[10px] print:flex print:text-zinc-500">
        <p>{t('paymentCard.computerGenerated')}</p>
        <p>
          {t('paymentCard.generatedOn', {
            date: dayjs()
              .locale(language)
              .format(
                language.startsWith('zh')
                  ? 'YYYY年MM月DD日 HH时mm分'
                  : 'DD MMMM YYYY, HH:mm'
              )
          })}
        </p>
      </footer>
    </Card>
  )
}
