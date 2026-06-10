import type { PaymentEntry } from '@'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import {
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  Flex,
  Text,
  surface,
  toast,
  useModalStore,
  usePersonalization
} from '@lifeforge/ui'

import LinkWalletTransactionModal from '@/components/modals/LinkWalletTransactionModal'
import ModifyPaymentEntryModal from '@/components/modals/ModifyPaymentEntryModal'
import { forgeAPI } from '@/manifest'
import type { CalculatedPayment } from '@/utils/calculations'

import StatusChip from './StatusChip'

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

  const { totalPayable, electricityBill, amountPaid } = calculations

  const walletAvailabilityQuery = useQuery(
    forgeAPI
      .checkModuleAvailability({
        moduleId: 'lifeforge--wallet'
      })
      .queryOptions()
  )

  const removeEntryMutation = useMutation(
    forgeAPI.entries.remove
      .input({
        id: entry.id
      })
      .mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['melvinchia3636--rentalPaymentTracker']
          })
        },
        onError: () => {
          toast.error('Failed to delete the payment entry.')
        }
      })
  )

  const unlinkWalletMutation = useMutation(
    forgeAPI.entries.unlinkWalletTransaction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['melvinchia3636--rentalPaymentTracker']
        })
        queryClient.invalidateQueries({ queryKey: ['wallet'] })
        toast.success('Wallet transaction unlinked successfully')
      },
      onError: () => {
        toast.error('Failed to unlink wallet transaction')
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
        await removeEntryMutation.mutateAsync(undefined)
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
    <Flex
      as="header"
      bg={breakdownCollapsed ? surface.defaultInteractive : undefined}
      justify="between"
      p="md"
      style={breakdownCollapsed ? { cursor: 'pointer' } : undefined}
      onClick={() => {
        if (!breakdownCollapsed) return

        setBreakdownCollapsed(false)
      }}
    >
      <div>
        <Text as="h3" size={{ base: 'xl', print: '2xl' }} weight="semibold">
          {dayjs()
            .month(entry.month - 1)
            .year(entry.year)
            .locale(language)
            .format(language.startsWith('zh') ? 'YYYY年MM月' : 'MMM YYYY')}
        </Text>
        <Text color={{ base: 'bg-500', print: 'zinc-500' }} mt="xs">
          <Text as="span" display={{ base: 'none', md: 'inline' }}>
            RM ({entry.rental_fee.toFixed(2)} + {entry.utility_bill.toFixed(2)}{' '}
            + {electricityBill.toFixed(2)}) ={' '}
          </Text>
          <Text as="span" color="custom-500" weight="medium">
            RM {totalPayable.toFixed(2)}
          </Text>
        </Text>
      </div>
      <Flex align="center" gap="md">
        <StatusChip amountPaid={amountPaid} totalPayable={totalPayable} />
        <Flex display={{ print: 'none' }}>
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
                  namespace="apps.melvinchia3636--rental-payment-tracker"
                  onClick={() => {
                    open(LinkWalletTransactionModal, { entry })
                  }}
                />
              )}
              {walletAvailabilityQuery.data && entry.wallet_entry_id && (
                <ContextMenuItem
                  icon="tabler:unlink"
                  label="Unlink Wallet Transaction"
                  namespace="apps.melvinchia3636--rental-payment-tracker"
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
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Header
