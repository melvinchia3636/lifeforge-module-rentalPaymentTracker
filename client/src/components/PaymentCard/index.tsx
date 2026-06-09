import dayjs from 'dayjs'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, Flex, PrintArea, Text, usePersonalization } from '@lifeforge/ui'

import type { PaymentEntry } from '../../index'
import type { CalculatedPayment } from '../../utils/calculations'
import DetailsSection from './components/DetailsSection'
import Header from './components/Header'

interface PaymentCardProps {
  entry: PaymentEntry
  calculations: CalculatedPayment
}

export default function PaymentCard({ entry, calculations }: PaymentCardProps) {
  const { t } = useTranslation('apps.melvinchia3636--rental-payment-tracker')

  const ref = useRef<HTMLDivElement>(null)

  const { language } = usePersonalization()

  const [breakdownCollapsed, setBreakdownCollapsed] = useState(true)

  return (
    <PrintArea contentRef={ref}>
      <Card
        aspectRatio={{ print: '1/1.414' }}
        bg={{ print: 'transparent' }}
        overflow="hidden"
        p="none"
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
        <Flex
          as="footer"
          display={{ base: 'none', print: 'flex' }}
          justify="between"
          style={{ marginTop: 'auto' }}
          width="100%"
        >
          <Text color={{ base: 'bg-500', print: 'zinc-500' }} size="xs">
            {t('paymentCard.computerGenerated')}
          </Text>
          <Text color={{ base: 'bg-500', print: 'zinc-500' }} size="xs">
            {t('paymentCard.generatedOn', {
              date: dayjs()
                .locale(language)
                .format(
                  language.startsWith('zh')
                    ? 'YYYY年MM月DD日 HH时mm分'
                    : 'DD MMMM YYYY, HH:mm'
                )
            })}
          </Text>
        </Flex>
      </Card>
    </PrintArea>
  )
}
