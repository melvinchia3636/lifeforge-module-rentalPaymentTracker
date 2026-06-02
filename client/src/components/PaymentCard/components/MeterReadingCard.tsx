import type { PaymentEntry } from '@'
import { useTranslation } from 'react-i18next'

import { Card, Flex, Icon, Text, surface } from '@lifeforge/ui'

function MeterReadingCard({ entry }: { entry: PaymentEntry }) {
  const { t } = useTranslation('apps.melvinchia3636$rentalPaymentTracker')

  return (
    <Card bg={{ ...surface.light, print: 'bg-100' }}>
      <Flex align="center" gap="sm" mb="sm">
        <Icon color="muted" icon="tabler:gauge" size="1.25em" />
        <Text
          color={{ base: 'bg-500', print: 'zinc-500' }}
          size={{ base: 'sm', print: 'xs' }}
          tracking="wider"
          transform="uppercase"
          weight="medium"
        >
          {t('paymentCard.meterReading')}
        </Text>
      </Flex>
      <Flex align="center" gap="xs">
        <Text color={{ base: 'bg-600', dark: 'bg-400' }} size="lg">
          {t('paymentCard.last')}
        </Text>
        <Text
          color={{ base: 'bg-800', dark: 'bg-100', print: 'bg-950' }}
          size="lg"
          weight="semibold"
        >
          {entry.previous_meter_reading} kWh
        </Text>
        <Icon color="bg-400" icon="tabler:arrow-right" size="1.5em" />
        <Text color={{ base: 'bg-600', dark: 'bg-400' }} size="lg">
          {t('paymentCard.this')}
        </Text>
        <Text
          color={{ base: 'bg-800', dark: 'bg-100', print: 'bg-950' }}
          size="lg"
          weight="semibold"
        >
          {entry.current_meter_reading} kWh
        </Text>
      </Flex>
      <Text color="custom-500" mt="sm" size="lg">
        {t('paymentCard.totalUsed')}:{' '}
        <Text as="span" size="lg" weight="semibold">
          {entry.electricity_used} kWh
        </Text>
      </Text>
    </Card>
  )
}

export default MeterReadingCard
