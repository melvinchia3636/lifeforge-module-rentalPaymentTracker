import type { PaymentEntry } from '@'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import {
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  TagChip,
  useModalStore
} from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { usePersonalization } from 'shared'
import COLORS from 'tailwindcss/colors'

import LinkWalletTransactionModal from '@/components/LinkWalletTransactionModal'
import ModifyPaymentEntryModal from '@/components/ModifyPaymentEntryModal'
import type { CalculatedPayment } from '@/utils/calculations'
import forgeAPI from '@/utils/forgeAPI'

function Header({
  entry,
  calculations,
  breakdownCollapsed,
  setBreakdownCollapsed
}: {
  entry: PaymentEntry
  calculations: CalculatedPayment
  breakdownCollapsed: boolean
  setBreakdownCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const queryClient = useQueryClient()

  const { open } = useModalStore()

  const { language } = usePersonalization()

  const { t } = useTranslation('apps.melvinchia3636$rentalPaymentTracker')

  const { totalPayable, electricityBill, amountPaid } = calculations

  const isExcessPayment = amountPaid >= totalPayable

  const walletAvailabilityQuery = useQuery(
    forgeAPI.modules.checkModuleAvailability
      .input({
        moduleId: 'wallet'
      })
      .queryOptions()
  )

  const removeEntryMutation = useMutation(
    forgeAPI.melvinchia3636$rentalPaymentTracker.entries.remove
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

  const unlinkWalletMutation = useMutation(
    forgeAPI.melvinchia3636$rentalPaymentTracker.entries.unlinkWalletTransaction.mutationOptions(
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['rentalPaymentTracker'] })
          queryClient.invalidateQueries({ queryKey: ['wallet'] })
          toast.success('Wallet transaction unlinked successfully')
        },
        onError: () => {
          toast.error('Failed to unlink wallet transaction')
        }
      }
    )
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

  function handleUnlinkWallet() {
    open(ConfirmationModal, {
      title: 'Unlink Wallet Transaction',
      description:
        'Are you sure you want to unlink the wallet transaction? The payment amount will be restored from the wallet transaction.',
      confirmButton: 'confirm',
      onConfirm: async () => {
        await unlinkWalletMutation.mutateAsync({
          entryId: entry.id
        })
      }
    })
  }

  return (
    <header
      className={clsx(
        'flex items-center justify-between p-4',
        breakdownCollapsed && 'component-bg-with-hover cursor-pointer'
      )}
      onClick={() => {
        if (!breakdownCollapsed) return

        setBreakdownCollapsed(false)
      }}
    >
      <div>
        <h3 className="text-xl font-semibold print:text-[24px]">
          {dayjs()
            .month(entry.month - 1)
            .year(entry.year)
            .locale(language)
            .format(language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY')}
        </h3>
        <p className="text-bg-500 mt-1 print:text-zinc-500">
          <span className="hidden md:inline">
            RM ({entry.rental_fee.toFixed(2)} + {entry.utility_bill.toFixed(2)}{' '}
            + {electricityBill.toFixed(2)}) ={' '}
          </span>
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
            <span className="hidden sm:inline">
              {isExcessPayment
                ? t('paymentCard.paidExcess')
                : t('paymentCard.paymentShortfall')}
            </span>
          }
        />
        <div className="flex items-center gap-2">
          {!breakdownCollapsed && (
            <ContextMenu
              classNames={{
                wrapper: 'print:hidden',
                menu: 'w-64'
              }}
            >
              {walletAvailabilityQuery.data && !entry.wallet_entry_id && (
                <ContextMenuItem
                  icon="tabler:wallet"
                  label="Link Wallet Transaction"
                  namespace="apps.melvinchia3636$rentalPaymentTracker"
                  onClick={() => {
                    open(LinkWalletTransactionModal, { entry })
                  }}
                />
              )}
              {walletAvailabilityQuery.data && entry.wallet_entry_id && (
                <ContextMenuItem
                  icon="tabler:unlink"
                  label="Unlink Wallet Transaction"
                  namespace="apps.melvinchia3636$rentalPaymentTracker"
                  onClick={handleUnlinkWallet}
                />
              )}
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
        </div>
      </div>
    </header>
  )
}

export default Header
