import type { PaymentEntry } from '@'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AutoSizer } from 'react-virtualized'

import { usePromiseLoading } from '@lifeforge/api'
import {
  Button,
  EmptyStateScreen,
  Flex,
  ModalHeader,
  Scrollbar,
  SearchInput,
  WithQuery,
  toast
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import TransactionListItem from './components/TransactionListItem'

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
    forgeAPI.entries.linkWalletTransaction.mutationOptions({
      onSuccess: () => {
        toast.success('Transaction linked successfully')
        queryClient.invalidateQueries({
          queryKey: ['melvinchia3636--rentalPaymentTracker']
        })
        queryClient.invalidateQueries({ queryKey: ['wallet'] })
        onClose()
      },
      onError: (error: Error) => {
        const errorMessage = error?.message || 'Failed to link transaction'

        if (errorMessage.includes('already linked to another payment entry')) {
          toast.error(
            'This wallet transaction is already linked to another payment entry'
          )
        } else {
          toast.error(errorMessage)
        }
      }
    })
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
    <Flex direction="column" minHeight="80vh" minWidth="60vw">
      <ModalHeader
        icon="tabler:wallet"
        title="Link Wallet Transaction"
        onClose={onClose}
      />
      <SearchInput
        bg="bg-100"
        debounceMs={300}
        searchTarget="transactions"
        value={searchQuery}
        onChange={setSearchQuery}
      />
      {searchQuery.length === 0 ? (
        <Flex centered flex="1">
          <EmptyStateScreen
            icon="tabler:search"
            message={{
              id: 'linkWalletQuery'
            }}
          />
        </Flex>
      ) : (
        <WithQuery query={transactionQuery}>
          {transactions => (
            <>
              {transactions.length === 0 ? (
                <Flex centered flex="1">
                  <EmptyStateScreen
                    message={{
                      id: 'noTransactionsFound'
                    }}
                  />
                </Flex>
              ) : (
                <Flex flex="1" height="100%" minHeight="0">
                  <AutoSizer>
                    {({ width, height }) => (
                      <Scrollbar
                        mt="lg"
                        style={{
                          width,
                          height
                        }}
                      >
                        <Flex as="ul" direction="column" gap="sm" height="100%">
                          {transactions.map(transaction => (
                            <li
                              key={transaction.id}
                              style={{
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor:
                                  selectedTransactionId?.id === transaction.id
                                    ? 'var(--color-custom-500)'
                                    : 'transparent',
                                borderRadius: 'var(--radius-lg)',
                                transition: 'all 150ms'
                              }}
                              onClick={() => {
                                setSelectedTransactionId(old =>
                                  old?.id === transaction.id
                                    ? null
                                    : transaction
                                )
                              }}
                            >
                              <TransactionListItem transaction={transaction} />
                            </li>
                          ))}
                        </Flex>
                      </Scrollbar>
                    )}
                  </AutoSizer>
                </Flex>
              )}
            </>
          )}
        </WithQuery>
      )}
      <Button
        disabled={!selectedTransactionId}
        icon="tabler:link"
        loading={loading}
        style={{
          marginTop: 'auto'
        }}
        onClick={onLinkTransaction}
      >
        Link Transaction
      </Button>
    </Flex>
  )
}

export default LinkWalletTransactionModal
