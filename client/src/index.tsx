import { useQueries, useQuery } from '@tanstack/react-query'
import {
  Button,
  ContextMenuItem,
  EmptyStateScreen,
  FAB,
  ModuleHeader,
  Scrollbar,
  Widget,
  WithQuery,
  useModalStore
} from 'lifeforge-ui'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { InferOutput } from 'shared'

import Amount from './components/Amount'
import ModifyPaymentEntryModal from './components/ModifyPaymentEntryModal'
import PaymentCard from './components/PaymentCard'
import SettingsModal from './components/SettingsModal'
import {
  type CalculatedPayment,
  calculateAllPrepayments
} from './utils/calculations'
import forgeAPI from './utils/forgeAPI'

export type PaymentEntry = InferOutput<
  typeof forgeAPI.rentalPaymentTracker.entries.getById
>

function RentalPaymentTracker() {
  const { t } = useTranslation('apps.rentalPaymentTracker')

  const open = useModalStore(state => state.open)

  const entriesQuery = useQuery(
    forgeAPI.rentalPaymentTracker.entries.list.queryOptions()
  )

  const settingsQuery = useQuery(
    forgeAPI.rentalPaymentTracker.settings.get.queryOptions()
  )

  // Clean up orphaned wallet links on mount
  useEffect(() => {
    const cleanup = async () => {
      try {
        await forgeAPI.rentalPaymentTracker.entries.cleanupOrphanedWalletLinks.mutate(
          {}
        )
      } catch (error) {
        // Silent fail - this is a background cleanup task
        console.debug('Wallet link cleanup completed or skipped', error)
      }
    }

    cleanup()
  }, [])

  // Get wallet entry IDs from entries that have them
  const walletEntryIds = useMemo(() => {
    if (!entriesQuery.data) return []

    return entriesQuery.data
      .filter(entry => entry.wallet_entry_id)
      .map(entry => ({ entryId: entry.id, walletId: entry.wallet_entry_id }))
  }, [entriesQuery.data])

  // Fetch wallet transactions for entries that have wallet_entry_id
  const walletQueries = useQueries({
    queries: walletEntryIds.map(({ entryId, walletId }) => ({
      queryKey: ['wallet', 'transaction', walletId],
      queryFn: async () => {
        const result = await forgeAPI
          .untyped('/wallet/transactions/getById')
          .input({ id: walletId })
          .query()

        return { entryId, amount: (result as { amount: number }).amount }
      },
      enabled: !!walletId,
      // Always fetch fresh data when component mounts
      refetchOnMount: 'always',
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      // Consider data stale immediately so it always refetches
      staleTime: 0
    }))
  })

  // Build a map of entry ID -> wallet amount
  const walletAmounts = useMemo(() => {
    const map = new Map<string, number>()

    for (const query of walletQueries) {
      if (query.data) {
        map.set(query.data.entryId, query.data.amount)
      }
    }

    return map
  }, [walletQueries])

  // Calculate all prepayments once settings, entries, and wallet amounts are loaded
  const calculations = useMemo(() => {
    if (!entriesQuery.data || !settingsQuery.data)
      return new Map<string, CalculatedPayment>()

    return calculateAllPrepayments(
      entriesQuery.data,
      settingsQuery.data,
      walletAmounts
    )
  }, [entriesQuery.data, settingsQuery.data, walletAmounts])

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
            className="hidden md:flex"
            icon="tabler:plus"
            tProps={{
              item: t('items.payment')
            }}
            onClick={() => {
              open(ModifyPaymentEntryModal, {
                openType: 'create'
              })
            }}
          >
            new
          </Button>
        }
        contextMenuProps={{
          children: (
            <>
              <ContextMenuItem
                icon="tabler:settings"
                label="settings"
                namespace="apps.rentalPaymentTracker"
                onClick={() => {
                  open(SettingsModal, {})
                }}
              />
            </>
          )
        }}
      />
      <WithQuery query={entriesQuery}>
        {entries =>
          entries.length === 0 ? (
            <EmptyStateScreen
              icon="tabler:receipt-off"
              message={{
                id: 'payment',
                namespace: 'apps.rentalPaymentTracker'
              }}
            />
          ) : (
            <Scrollbar>
              <Widget
                actionComponent={
                  <Amount
                    amount={
                      calculations.size > 0
                        ? Array.from(calculations.values())[
                            calculations.size - 1
                          ].currentPrepayment
                        : 0
                    }
                    className="hidden sm:flex"
                  />
                }
                className="mb-6 h-min"
                icon="tabler:cash-plus"
                namespace="apps.rentalPaymentTracker"
                title="Prepaid Amount"
              >
                <Amount
                  amount={
                    calculations.size > 0
                      ? Array.from(calculations.values())[calculations.size - 1]
                          .currentPrepayment
                      : 0
                  }
                  className="flex-center w-full sm:hidden"
                />
              </Widget>
              <div className="space-y-4 pb-8">
                {entries.map(entry => {
                  const calc = calculations.get(entry.id)

                  if (!calc) return null

                  return (
                    <PaymentCard
                      key={entry.id}
                      calculations={calc}
                      entry={entry}
                    />
                  )
                })}
              </div>
            </Scrollbar>
          )
        }
      </WithQuery>
      <FAB
        className="fixed right-6 bottom-6 md:hidden"
        icon="tabler:plus"
        onClick={() => {
          open(ModifyPaymentEntryModal, {
            openType: 'create'
          })
        }}
      />
    </>
  )
}

export default RentalPaymentTracker
