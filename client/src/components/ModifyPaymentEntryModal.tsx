import type { PaymentEntry } from '@'
import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormModal, defineForm } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { type InferInput, getFormFileFieldInitialData } from 'shared'

import forgeAPI from '../utils/forgeAPI'

type FormData = InferInput<
  typeof forgeAPI.rentalPaymentTracker.entries.create
>['body']

export default function ModifyPaymentEntryModal({
  onClose,
  data: { openType, initialData }
}: {
  onClose: () => void
  data: {
    openType: 'create' | 'update'
    initialData?: PaymentEntry
  }
}) {
  const { t } = useTranslation('apps.rentalPaymentTracker')

  const qc = useQueryClient()

  const settingsQuery = useQuery(
    forgeAPI.rentalPaymentTracker.settings.get.queryOptions()
  )

  const entriesQuery = useQuery(
    forgeAPI.rentalPaymentTracker.entries.list.queryOptions()
  )

  const mutation = useMutation(
    (openType === 'create'
      ? forgeAPI.rentalPaymentTracker.entries.create
      : forgeAPI.rentalPaymentTracker.entries.update.input({
          id: initialData!.id!
        })
    ).mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['rentalPaymentTracker'] })
        qc.invalidateQueries({ queryKey: ['wallet'] })
      },
      onError: error => {
        toast.error('Failed to submit payment entry.')
        console.error('Error submitting form:', error)
      }
    })
  )

  if (!settingsQuery.data || !entriesQuery.data) {
    return null
  }

  const settings = settingsQuery.data

  const entries = entriesQuery.data

  // Get the last entry for previous meter reading
  const lastEntry = entries.length > 0 ? entries[0] : null

  const previousMeterReading =
    initialData?.previous_meter_reading ??
    lastEntry?.current_meter_reading ??
    settings.initial_meter_reading

  const currentDate = new Date()

  const { formProps } = defineForm<FormData>({
    title: `payment.${openType}`,
    icon: 'tabler:receipt',
    onClose,
    namespace: 'apps.rentalPaymentTracker',
    submitButton: openType === 'create' ? 'create' : 'update'
  })
    .typesMap({
      month: 'listbox',
      year: 'number',
      previous_meter_reading: 'number',
      current_meter_reading: 'number',
      electricity_rate: 'number',
      utility_bill: 'number',
      rental_fee: 'number',
      amount_paid: 'number',
      meter_reading_image: 'file',
      bank_statement: 'file',
      electricity_used: 'number',
      auto_create_wallet_transaction: 'checkbox',
      wallet_entry_id: 'text'
    })
    .setupFields({
      month: {
        icon: 'tabler:calendar-month',
        label: 'Month',
        required: true,
        multiple: false,
        options: Array.from({ length: 12 }, (_, i) => ({
          text: t(`common.misc:dates.months.${i}`),
          value: i + 1
        }))
      },
      year: {
        icon: 'tabler:calendar',
        label: 'Year',
        required: true
      },
      previous_meter_reading: {
        icon: 'tabler:gauge',
        label: 'Previous Meter Reading',
        required: true
      },
      current_meter_reading: {
        icon: 'tabler:gauge',
        label: 'Current Meter Reading',
        required: true
      },
      amount_paid: {
        icon: 'tabler:cash',
        label: `Amount Paid`,
        required: true,
        disabled: openType === 'update' && !!initialData?.wallet_entry_id,
        disabledReason: (
          <div className="w-72">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Icon className="size-5 shrink-0" icon="tabler:link" />
              {t('empty.transactionLinked.title')}
            </h3>
            <p className="text-bg-500">
              {t('empty.transactionLinked.description')}
            </p>
          </div>
        )
      },
      meter_reading_image: {
        icon: 'tabler:photo',
        optional: true,
        label: 'Meter Reading Image',
        required: false,
        acceptedMimeTypes: { image: ['png', 'jpeg', 'webp'] }
      },
      bank_statement: {
        icon: 'tabler:report-money',
        optional: true,
        label: 'Bank Statement',
        required: false,
        acceptedMimeTypes: {
          image: ['png', 'jpeg', 'webp'],
          application: ['pdf']
        }
      },
      auto_create_wallet_transaction: {
        icon: 'tabler:wallet',
        label: 'Auto create Wallet Transaction',
        hidden: openType === 'update'
      }
    })
    .initialData({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      previous_meter_reading: previousMeterReading,
      current_meter_reading: 0,
      electricity_rate: settings.electricity_rate,
      utility_bill: settings.utility_bill,
      rental_fee: settings.rental_fee,
      amount_paid: 0,
      ...initialData,
      bank_statement: getFormFileFieldInitialData(
        forgeAPI,
        initialData,
        initialData?.bank_statement
      ),
      meter_reading_image: getFormFileFieldInitialData(
        forgeAPI,
        initialData,
        initialData?.meter_reading_image
      )
    })
    .onSubmit(async formData => {
      // Calculate electricity used
      const electricityUsed =
        formData.current_meter_reading - formData.previous_meter_reading

      await mutation.mutateAsync({
        ...formData,
        month: formData.month!,
        electricity_used: electricityUsed
      })
    })
    .build()

  return <FormModal {...formProps} />
}
