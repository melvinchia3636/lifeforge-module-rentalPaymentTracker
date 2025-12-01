import forgeAPI from '@/utils/forgeAPI'
import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import {
  Button,
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  TagChip,
  ViewImageModal,
  useModalStore
} from 'lifeforge-ui'
import { useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'react-toastify'
import { usePersonalization } from 'shared'
import COLORS from 'tailwindcss/colors'

import type { PaymentEntry } from '../index'
import type { CalculatedPayment } from '../utils/calculations'
import ModifyPaymentEntryModal from './ModifyPaymentEntryModal'

interface PaymentCardProps {
  entry: PaymentEntry
  calculations: CalculatedPayment
}

export default function PaymentCard({ entry, calculations }: PaymentCardProps) {
  const open = useModalStore(state => state.open)

  const queryClient = useQueryClient()

  const { t } = useTranslation('apps.rentalPaymentTracker')

  const ref = useRef<HTMLDivElement>(null)

  const { language } = usePersonalization()

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

  const removeEntryMutation = useMutation(
    forgeAPI.rentalPaymentTracker.entries.remove
      .input({
        id: entry.id
      })
      .mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['rentalPaymentTracker'] })
        },
        onError: () => {
          toast.error('Failed to delete the payment entry.')
        }
      })
  )

  function handleDelete() {
    open(ConfirmationModal, {
      title: 'Delete Payment Entry',
      description:
        'Are you sure you want to delete this payment entry? This action cannot be undone.',
      confirmButton: 'delete',
      onConfirm: async () => {
        await removeEntryMutation.mutateAsync({})
      }
    })
  }

  function handleViewImage(src: string) {
    open(ViewImageModal, {
      src
    })
  }

  const {
    electricityBill,
    totalPayable,
    previousPrepayment,
    currentPrepayment
  } = calculations

  const isExcessPayment = entry.amount_paid >= totalPayable

  return (
    <Card
      ref={ref}
      className="flex flex-col p-6 print:aspect-[1/1.414] print:w-full print:bg-white print:p-12 print:font-[Onest]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold print:text-[24px]">
            {dayjs()
              .month(entry.month - 1)
              .year(entry.year)
              .locale(language)
              .format(language.startsWith('zh') ? 'YYYY年MM月' : 'MMMM YYYY')}
          </h3>
          <p className="text-bg-500 text-sm print:text-zinc-500">
            {t('paymentCard.payableAmount')}: RM {totalPayable.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TagChip
            color={isExcessPayment ? COLORS.green[500] : COLORS.orange[500]}
            icon={isExcessPayment ? 'tabler:check' : 'tabler:alert-circle'}
            label={
              isExcessPayment
                ? t('paymentCard.paidExcess')
                : t('paymentCard.paymentShortfall')
            }
          />
          <ContextMenu
            classNames={{
              wrapper: 'print:hidden'
            }}
          >
            <ContextMenuItem
              icon="tabler:pencil"
              label="Edit"
              onClick={() => {
                open(ModifyPaymentEntryModal, {
                  openType: 'update',
                  initialData: entry
                })
              }}
            />
            <ContextMenuItem
              dangerous
              icon="tabler:trash"
              label="Delete"
              onClick={handleDelete}
            />
          </ContextMenu>
        </div>
      </div>
      <div className="space-y-2">
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

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-bg-500 w-full pt-2 pb-1.5 text-left text-sm font-normal print:text-zinc-500" />
              <th className="text-bg-500 px-4 pt-2 pb-1.5 text-center text-sm font-medium print:text-zinc-500">
                RM
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Total Payable Breakdown */}
            <tr className="odd:bg-bg-800/30">
              <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
                {t('paymentCard.baseRentalFee')}
              </td>
              <td className="text-bg-800 dark:text-bg-100 px-4 py-3 text-right font-medium">
                {entry.rental_fee.toFixed(2)}
              </td>
            </tr>
            <tr className="odd:bg-bg-800/30">
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
            <tr className="odd:bg-bg-800/30">
              <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
                {t('paymentCard.fixedUtilityBill')}
              </td>
              <td className="text-bg-800 dark:text-bg-100 px-4 py-3 text-right font-medium">
                {entry.utility_bill.toFixed(2)}
              </td>
            </tr>

            {/* Total Payable */}
            <tr className="odd:bg-bg-800/30">
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
            <tr className="odd:bg-bg-800/30">
              <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
                {t('paymentCard.paymentMade')}
              </td>
              <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                {entry.amount_paid.toFixed(2)}
              </td>
            </tr>
            <tr className="odd:bg-bg-800/30">
              <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
                <Trans
                  i18nKey="paymentCard.lessTotalPayable"
                  ns="apps.rentalPaymentTracker"
                />
              </td>
              <td className="text-bg-800 dark:text-bg-100 border-bg-200 dark:border-bg-700 border-b-[1.5px] px-4 py-3 text-right font-medium print:border-zinc-300">
                ({totalPayable.toFixed(2)})
              </td>
            </tr>

            {/* Excess/Shortfall */}
            <tr className="odd:bg-bg-800/30">
              <td className="text-bg-500 px-4 py-3 font-medium print:text-zinc-500">
                {t('paymentCard.paymentExcessShortfall')}:
              </td>
              <td
                className={clsx(
                  'px-4 py-3 text-right font-medium',
                  entry.amount_paid - totalPayable >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {entry.amount_paid - totalPayable >= 0
                  ? (entry.amount_paid - totalPayable).toFixed(2)
                  : `(${(totalPayable - entry.amount_paid).toFixed(2)})`}
              </td>
            </tr>
            <tr className="odd:bg-bg-800/30">
              <td className="text-bg-500 px-4 py-3 print:text-zinc-500">
                {t('paymentCard.prepaymentCarriedDown', {
                  month: dayjs()
                    .month(entry.month - 2)
                    .year(entry.month === 1 ? entry.year - 1 : entry.year)
                    .locale(language)
                    .format(
                      language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY'
                    )
                })}
              </td>
              <td className="text-bg-800 dark:text-bg-100 px-4 py-3 text-right font-medium">
                {previousPrepayment.toFixed(2)}
              </td>
            </tr>

            {/* Final Prepayment */}
            <tr className="odd:bg-bg-800/30">
              <td className="text-bg-800 dark:text-bg-100 px-4 py-3 font-semibold">
                {t('paymentCard.prepaymentBroughtDown', {
                  month: dayjs()
                    .month(entry.month)
                    .year(entry.month === 12 ? entry.year + 1 : entry.year)
                    .locale(language)
                    .format(
                      language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY'
                    )
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
      </div>
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
