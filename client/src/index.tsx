import { useQuery } from '@tanstack/react-query'
import {
  Button,
  ContextMenuItem,
  EmptyStateScreen,
  ModuleHeader,
  WithQuery,
  useModalStore
} from 'lifeforge-ui'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { InferOutput } from 'shared'

import ModifyPaymentEntryModal from './components/ModifyPaymentEntryModal'
import PaymentCard from './components/PaymentCard'
import SettingsModal from './components/SettingsModal'
import { calculateAllPrepayments } from './utils/calculations'
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

  // Calculate all prepayments once settings and entries are loaded
  const calculations = useMemo(() => {
    if (!entriesQuery.data || !settingsQuery.data) return new Map()

    return calculateAllPrepayments(entriesQuery.data, settingsQuery.data)
  }, [entriesQuery.data, settingsQuery.data])

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
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
            <div className="space-y-4">
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
          )
        }
      </WithQuery>
    </>
  )
}

export default RentalPaymentTracker
