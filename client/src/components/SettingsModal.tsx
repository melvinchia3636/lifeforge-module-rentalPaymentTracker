import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormModal, defineForm } from 'lifeforge-ui'
import type { InferInput } from 'shared'

import forgeAPI from '../utils/forgeAPI'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()

  const settingsQuery = useQuery(
    forgeAPI.rentalPaymentTracker.settings.get.queryOptions()
  )

  const mutation = useMutation(
    forgeAPI.rentalPaymentTracker.settings.update.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['rentalPaymentTracker', 'settings'] })
        onClose()
      }
    })
  )

  if (!settingsQuery.data) {
    return null
  }

  const { formProps } = defineForm<
    InferInput<typeof forgeAPI.rentalPaymentTracker.settings.update>['body']
  >({
    title: 'Settings',
    icon: 'tabler:settings',
    namespace: 'apps.rentalPaymentTracker',
    onClose,
    submitButton: {
      icon: 'tabler:save',
      children: 'Save'
    }
  })
    .typesMap({
      initial_prepayment: 'currency',
      initial_meter_reading: 'number',
      electricity_rate: 'currency',
      utility_bill: 'currency',
      rental_fee: 'currency'
    })
    .setupFields({
      initial_prepayment: {
        icon: 'tabler:cash-plus',
        label: 'Initial Prepayment Balance',
        required: true
      },
      initial_meter_reading: {
        icon: 'tabler:gauge',
        label: 'Initial Meter Reading',
        required: true
      },
      electricity_rate: {
        icon: 'tabler:bolt',
        label: 'Electricity Rate',
        required: true
      },
      utility_bill: {
        icon: 'tabler:droplet-dollar',
        label: 'Utility Bill',
        required: true
      },
      rental_fee: {
        icon: 'tabler:home-dollar',
        label: 'Rental Fee',
        required: true
      }
    })
    .initialData(settingsQuery.data)
    .onSubmit(async data => {
      await mutation.mutateAsync(data)
    })
    .build()

  return <FormModal {...formProps} />
}
