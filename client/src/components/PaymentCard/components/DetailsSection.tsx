import type { PaymentEntry } from '@'
import type { CalculatedPayment } from '@/utils/calculations'
import forgeAPI from '@/utils/forgeAPI'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Button, ViewImageModal, useModalStore } from 'lifeforge-ui'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { useDivSize } from 'shared'

import BreakdownTable from './BreakdownTable'
import MeterReadingCard from './MeterReadingCard'

function DetailsSection({
  collapsed,
  entry,
  calculations,
  containerRef: ref
}: {
  collapsed: boolean
  entry: PaymentEntry
  calculations: CalculatedPayment
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const thisRef = useRef<HTMLDivElement>(null)

  const { height } = useDivSize(thisRef)

  const open = useModalStore(state => state.open)

  const { t } = useTranslation('apps.rentalPaymentTracker')

  const fontQuery = useQuery(
    forgeAPI.user.personalization.getGoogleFont
      .input({
        family: 'Onest'
      })
      .queryOptions()
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
      <div ref={thisRef} className="space-y-2 pt-6">
        <MeterReadingCard entry={entry} />
        <BreakdownTable calculations={calculations} entry={entry} />
        <div className="mt-8 space-y-2 print:hidden">
          {(entry.meter_reading_image || entry.bank_statement) && (
            <div className="flex gap-2">
              {entry.meter_reading_image && (
                <Button
                  className="flex-1"
                  icon="tabler:photo"
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
                  {t('buttons.viewMeterReadingImage')}
                </Button>
              )}
              {
                <Button
                  className="flex-1"
                  icon="tabler:report-money"
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
                  {t('buttons.viewBankStatement')}
                </Button>
              }
            </div>
          )}
          <Button
            className="mt-4 w-full"
            icon="tabler:printer"
            loading={fontQuery.isLoading}
            variant="primary"
            onClick={reactToPrintFn}
          >
            {t('buttons.print')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DetailsSection
