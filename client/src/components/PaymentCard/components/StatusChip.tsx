import { useTranslation } from 'react-i18next'

import { TAILWIND_PALETTE, TagChip, Text } from '@lifeforge/ui'

function StatusChip({
  amountPaid,
  totalPayable
}: {
  amountPaid: number
  totalPayable: number
}) {
  const isExact = amountPaid === totalPayable

  const isExcess = amountPaid > totalPayable

  const { t } = useTranslation('apps.melvinchia3636--rental-payment-tracker')

  return (
    <TagChip
      color={
        isExact
          ? TAILWIND_PALETTE.blue[500]
          : isExcess
            ? TAILWIND_PALETTE.green[500]
            : TAILWIND_PALETTE.orange[500]
      }
      icon={
        isExact
          ? 'tabler:check'
          : isExcess
            ? 'tabler:check'
            : 'tabler:alert-circle'
      }
      label={
        <Text as="span" display={{ base: 'none', sm: 'inline' }}>
          {isExact
            ? t('paymentCard.paidExact')
            : isExcess
              ? t('paymentCard.paidExcess')
              : t('paymentCard.paymentShortfall')}
        </Text>
      }
    />
  )
}

export default StatusChip
