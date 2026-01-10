import type { PaymentEntry } from '@'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Button, ViewImageModal, useModalStore } from 'lifeforge-ui'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { useDivSize } from 'shared'

import TransactionListItem from '@/components/TransactionListItem'
import type { CalculatedPayment } from '@/utils/calculations'
import forgeAPI from '@/utils/forgeAPI'

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

  const { t } = useTranslation('apps.melvinchia3636$rentalPaymentTracker')

  const fontQuery = useQuery(
    forgeAPI.user.personalization.getGoogleFont
      .input({
        family: 'Onest'
      })
      .queryOptions()
  )

  const walletAvailabilityQuery = useQuery(
    forgeAPI.modules.checkModuleAvailability
      .input({
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
    fonts: fontQuery.data?.items.length
      ? [
          {
            family: fontQuery.data.items[0].family,
            source: fontQuery.data.items[0].files.regular
          }
        ]
      : [],
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
    <div
      className="space-y-2 overflow-hidden transition-all duration-300"
      style={{ maxHeight: collapsed ? 0 : height }}
    >
      <div ref={thisRef} className="space-y-2 p-4 pt-6">
        <MeterReadingCard entry={entry} />
        <BreakdownTable calculations={calculations} entry={entry} />
        {walletEntryQuery.data && (
          <div className="mt-6 space-y-3 print:hidden">
            <h3 className="text-bg-500 flex items-center gap-2 text-lg font-semibold print:text-zinc-500">
              <Icon className="size-6" icon="tabler:wallet" />
              {t('paymentCard.linkedWalletTransaction')}
            </h3>
            <TransactionListItem
              className="component-bg-lighter hover:bg-bg-200! dark:hover:bg-bg-800! print:bg-zinc-100"
              transaction={walletEntryQuery.data}
            />
          </div>
        )}
        <div className="mt-8 space-y-2 print:hidden">
          {(entry.meter_reading_image || entry.bank_statement) && (
            <div className="flex flex-col gap-2 md:flex-row">
              {entry.meter_reading_image && (
                <Button
                  className="flex-1"
                  icon="tabler:photo"
                  namespace="apps.melvinchia3636$rentalPaymentTracker"
                  variant="secondary"
                  onClick={() =>
                    handleViewImage(
                      forgeAPI.media.input({
                        collectionId: entry.collectionId,
                        fieldId: entry.meter_reading_image,
                        recordId: entry.id
                      }).endpoint
                    )
                  }
                >
                  View Meter Reading Image
                </Button>
              )}
              {
                <Button
                  className="flex-1"
                  icon="tabler:report-money"
                  namespace="apps.melvinchia3636$rentalPaymentTracker"
                  variant="secondary"
                  onClick={() =>
                    handleViewImage(
                      forgeAPI.media.input({
                        collectionId: entry.collectionId,
                        fieldId: entry.bank_statement,
                        recordId: entry.id
                      }).endpoint
                    )
                  }
                >
                  View Bank Statement
                </Button>
              }
            </div>
          )}
          <Button
            className="mt-4 w-full"
            icon="tabler:printer"
            loading={fontQuery.isLoading}
            namespace="apps.melvinchia3636$rentalPaymentTracker"
            variant="primary"
            onClick={reactToPrintFn}
          >
            print
          </Button>
        </div>
        <Button
          className="mt-4 w-full print:hidden"
          icon="tabler:chevron-up"
          namespace="apps.melvinchia3636$rentalPaymentTracker"
          variant="plain"
          onClick={() => setCollapsed(true)}
        >
          collapse Details
        </Button>
      </div>
    </div>
  )
}

export default DetailsSection
