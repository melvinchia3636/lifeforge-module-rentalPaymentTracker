import type { PaymentEntry } from '@'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  EmptyStateScreen,
  ModalHeader,
  Scrollbar,
  SearchInput,
  WithQuery
} from 'lifeforge-ui'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { AutoSizer } from 'react-virtualized'
import { usePromiseLoading } from 'shared'

import forgeAPI from '@/utils/forgeAPI'

import TransactionListItem from './TransactionListItem'

function LinkWalletTransactionModal({
  data: { entry },
  onClose
}: {
  data: { entry: PaymentEntry }
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')

  const [selectedTransactionId, setSelectedTransactionId] = useState<{
    id: string
    amount: number
  } | null>(null)

  const transactionQuery = useQuery<
    {
      id: string
      amount: number
    }[]
  >(
    forgeAPI
      .untyped('/wallet/transactions/list')
      .input({
        q: searchQuery,
        type: 'expenses'
      })
      .queryOptions({
        enabled: searchQuery.length > 0
      })
  )

  const linkTransactionMutation = useMutation(
    forgeAPI.melvinchia3636$rentalPaymentTracker.entries.linkWalletTransaction.mutationOptions(
      {
        onSuccess: () => {
          toast.success('Transaction linked successfully')
          queryClient.invalidateQueries({ queryKey: ['rentalPaymentTracker'] })
          queryClient.invalidateQueries({ queryKey: ['wallet'] })
          onClose()
        },
        onError: (error: Error) => {
          const errorMessage = error?.message || 'Failed to link transaction'

          if (
            errorMessage.includes('already linked to another payment entry')
          ) {
            toast.error(
              'This wallet transaction is already linked to another payment entry'
            )
          } else {
            toast.error(errorMessage)
          }
        }
      }
    )
  )

  async function handleLinkTransaction() {
    if (!selectedTransactionId) return

    await linkTransactionMutation.mutateAsync({
      entryId: entry.id,
      transactionId: selectedTransactionId.id
    })
  }

  const [loading, onLinkTransaction] = usePromiseLoading(handleLinkTransaction)

  return (
    <div className="flex min-h-[80vh] min-w-[60vw] flex-col">
      <ModalHeader
        icon="tabler:wallet"
        title="Link Wallet Transaction"
        onClose={onClose}
      />
      <SearchInput
        className="component-bg-lighter"
        debounceMs={300}
        searchTarget="transactions"
        value={searchQuery}
        onChange={setSearchQuery}
      />
      {searchQuery.length === 0 ? (
        <div className="flex-center flex-1">
          <EmptyStateScreen
            icon="tabler:search"
            message={{
              id: 'linkWalletQuery',
              namespace: 'apps.melvinchia3636$rentalPaymentTracker'
            }}
          />
        </div>
      ) : (
        <WithQuery query={transactionQuery}>
          {transactions => (
            <>
              {transactions.length === 0 ? (
                <div className="flex-center flex-1">
                  <EmptyStateScreen
                    message={{
                      id: 'noTransactionsFound',
                      namespace: 'apps.melvinchia3636$rentalPaymentTracker'
                    }}
                  />
                </div>
              ) : (
                <div className="h-full min-h-0 flex-1">
                  <AutoSizer>
                    {({ width, height }) => (
                      <Scrollbar
                        className="mt-6"
                        style={{
                          width,
                          height
                        }}
                      >
                        <ul className="space-y-3">
                          {transactions.map(transaction => (
                            <li
                              key={transaction.id}
                              className={`cursor-pointer border-2 transition-all ${
                                selectedTransactionId?.id === transaction.id
                                  ? 'border-custom-500'
                                  : 'border-transparent'
                              } rounded-lg`}
                              onClick={() => {
                                setSelectedTransactionId(old =>
                                  old?.id === transaction.id
                                    ? null
                                    : transaction
                                )
                              }}
                            >
                              <TransactionListItem
                                className="component-bg-lighter"
                                transaction={transaction}
                              />
                            </li>
                          ))}
                        </ul>
                      </Scrollbar>
                    )}
                  </AutoSizer>
                </div>
              )}
            </>
          )}
        </WithQuery>
      )}
      <Button
        className="mt-auto"
        disabled={!selectedTransactionId}
        icon="tabler:link"
        loading={loading}
        onClick={onLinkTransaction}
      >
        Link Transaction
      </Button>
    </div>
  )
}

export default LinkWalletTransactionModal
