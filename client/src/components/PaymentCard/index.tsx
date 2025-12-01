import forgeAPI from '@/utils/forgeAPI'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import {
  Button,
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  TagChip,
  useModalStore
} from 'lifeforge-ui'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { usePersonalization } from 'shared'
import COLORS from 'tailwindcss/colors'

import type { PaymentEntry } from '../../index'
import type { CalculatedPayment } from '../../utils/calculations'
import ModifyPaymentEntryModal from '../ModifyPaymentEntryModal'
import DetailsSection from './components/DetailsSection'

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

  const [breakdownCollapsed, setBreakdownCollapsed] = useState(true)

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

  const { totalPayable, electricityBill } = calculations

  const isExcessPayment = entry.amount_paid >= totalPayable

  return (
    <Card
      ref={ref}
      className="flex flex-col p-6 print:aspect-[1/1.414] print:w-full print:bg-white print:p-12 print:font-[Onest]"
    >
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold print:text-[24px]">
            {dayjs()
              .month(entry.month - 1)
              .year(entry.year)
              .locale(language)
              .format(language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY')}
          </h3>
          <p className="text-bg-500 mt-1 print:text-zinc-500">
            RM ({entry.rental_fee.toFixed(2)} + {entry.utility_bill.toFixed(2)}{' '}
            + {electricityBill.toFixed(2)}) ={' '}
            <span className="text-custom-500 font-medium">
              RM {totalPayable.toFixed(2)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TagChip
            color={isExcessPayment ? COLORS.green[500] : COLORS.orange[500]}
            icon={isExcessPayment ? 'tabler:check' : 'tabler:alert-circle'}
            label={
              isExcessPayment
                ? t('paymentCard.paidExcess')
                : t('paymentCard.paymentShortfall')
            }
          />
          <div className="flex items-center gap-2">
            {!breakdownCollapsed && (
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
            )}
            <Button
              className="print:hidden"
              icon="tabler:chevron-right"
              iconClassName={clsx(
                'transition-transform',
                !breakdownCollapsed && 'rotate-90'
              )}
              variant="plain"
              onClick={() => setBreakdownCollapsed(prev => !prev)}
            />
          </div>
        </div>
      </header>
      <DetailsSection
        calculations={calculations}
        collapsed={breakdownCollapsed}
        containerRef={ref}
        entry={entry}
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
