import type { PaymentEntry } from '@'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'

import {
  Box,
  Button,
  Flex,
  Icon,
  Stack,
  Text,
  ViewImageModal,
  useDivSize,
  useModalStore
} from '@lifeforge/ui'

import TransactionListItem from '@/components/modals/LinkWalletTransactionModal/components/TransactionListItem'
import { forgeAPI } from '@/manifest'
import type { CalculatedPayment } from '@/utils/calculations'

import BreakdownTable from './BreakdownTable'
import MeterReadingCard from './MeterReadingCard'

function DetailsSection({
  collapsed,
  setCollapsed,
  entry,
  calculations,
  containerRef: ref
}: {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  entry: PaymentEntry
  calculations: CalculatedPayment
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const thisRef = useRef<HTMLDivElement>(null)

  const { height } = useDivSize(thisRef)

  const { open } = useModalStore()

  const { t } = useTranslation('apps.melvinchia3636--rental-payment-tracker')

  const fontQuery = useQuery(
    forgeAPI
      .getGoogleFont({
        family: 'Onest'
      })
      .queryOptions()
  )

  const walletAvailabilityQuery = useQuery(
    forgeAPI
      .checkModuleAvailability({
        moduleId: 'wallet'
      })
      .queryOptions()
  )

  const walletEntryQuery = useQuery(
    forgeAPI
      .untyped('/wallet/transactions/getById')
      .input({ id: entry.wallet_entry_id })
      .queryOptions({
        enabled:
          walletAvailabilityQuery.data === true && !!entry.wallet_entry_id
      })
  )

  const reactToPrintFn = useReactToPrint({
    contentRef: ref,
    documentTitle: `RentalPayment_${dayjs()
      .month(entry.month - 1)
      .year(entry.year)
      .format('MMMM_YYYY')}`
  })

  function handleViewImage(src: string) {
    open(ViewImageModal, {
      src
    })
  }

  return (
    <Box
      className="transition-all duration-300"
      overflow="hidden"
      style={{ maxHeight: collapsed ? 0 : height }}
    >
      <Stack ref={thisRef} gap="sm" p="md" pt="lg">
        <MeterReadingCard entry={entry} />
        <BreakdownTable calculations={calculations} entry={entry} />
        {walletEntryQuery.data && (
          <Stack display={{ base: 'flex', print: 'none' }} gap="sm" mt="lg">
            <Flex align="center" gap="sm">
              <Icon
                color={{ base: 'bg-500', print: 'zinc-500' }}
                icon="tabler:wallet"
                size="1.5em"
              />
              <Text
                color={{ base: 'bg-500', print: 'zinc-500' }}
                size="lg"
                weight="semibold"
              >
                {t('paymentCard.linkedWalletTransaction')}
              </Text>
            </Flex>
            <TransactionListItem transaction={walletEntryQuery.data} />
          </Stack>
        )}
        <Stack display={{ base: 'flex', print: 'none' }} gap="sm" mt="2xl">
          {(entry.meter_reading_image || entry.bank_statement) && (
            <Flex direction={{ base: 'column', md: 'row' }} gap="sm">
              {entry.meter_reading_image && (
                <Button
                  flex="1"
                  icon="tabler:photo"
                  namespace="apps.melvinchia3636--rental-payment-tracker"
                  variant="secondary"
                  onClick={() =>
                    handleViewImage(
                      forgeAPI.getMedia({
                        collectionId: entry.collectionId,
                        fieldId: entry.meter_reading_image,
                        recordId: entry.id
                      })
                    )
                  }
                >
                  View Meter Reading Image
                </Button>
              )}
              {entry.bank_statement && (
                <Button
                  flex="1"
                  icon="tabler:report-money"
                  namespace="apps.melvinchia3636--rental-payment-tracker"
                  variant="secondary"
                  onClick={() =>
                    handleViewImage(
                      forgeAPI.getMedia({
                        collectionId: entry.collectionId,
                        fieldId: entry.bank_statement,
                        recordId: entry.id
                      })
                    )
                  }
                >
                  View Bank Statement
                </Button>
              )}
            </Flex>
          )}
          <Button
            icon="tabler:printer"
            loading={fontQuery.isLoading}
            mt="md"
            namespace="apps.melvinchia3636--rental-payment-tracker"
            variant="primary"
            width="100%"
            onClick={reactToPrintFn}
          >
            print
          </Button>
        </Stack>
        <Button
          display={{ base: 'flex', print: 'none' }}
          icon="tabler:chevron-up"
          mt="md"
          namespace="apps.melvinchia3636--rental-payment-tracker"
          variant="plain"
          width="100%"
          onClick={() => setCollapsed(true)}
        >
          collapse Details
        </Button>
      </Stack>
    </Box>
  )
}

export default DetailsSection
