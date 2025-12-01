import { useQuery } from '@tanstack/react-query'
import {
  Button,
  EmptyStateScreen,
  ModuleHeader,
  WithQuery,
  useModalStore
} from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import type { InferOutput } from 'shared'

import EntryItem from './components/EntryItem'
import ModifyEntryModal from './components/ModifyEntryModal'
import forgeAPI from './utils/forgeAPI'

export type Entry = InferOutput<typeof forgeAPI.rentalPaymentTracker.entries.getById>

function RentalPaymentTracker() {
  const { t } = useTranslation('apps.rentalPaymentTracker')

  const open = useModalStore(state => state.open)

  const entriesQuery = useQuery(forgeAPI.rentalPaymentTracker.entries.list.queryOptions())

  return (
    <>
      <ModuleHeader
        actionButton={
          <Button
            icon="tabler:plus"
            tProps= {{
              item: t('items.entry')
            }}  
            onClick={() => {
              open(ModifyEntryModal, {
                openType: 'create'
              })
            }}
          >
            new
          </Button>
        }
      />
      <WithQuery query={entriesQuery}>
        {entries =>
          entries.length === 0 ? (
            <EmptyStateScreen
              icon="tabler:cube-off"
              name="entry"
              namespace="apps.rentalPaymentTracker"
            />
          ) : (
            <div className="space-y-3">
              {entries.map(entry => (
                <EntryItem key={entry.id} entry={entry} />
              ))}
            </div>
          )
        }
      </WithQuery>
    </>
  )
}

export default RentalPaymentTracker
