import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import z from 'zod'

import {
  Box,
  CheckboxField,
  FileField,
  Flex,
  FormModal,
  ListboxField,
  NumberField,
  Text,
  Tooltip,
  convertFormFileFieldData,
  createDefaultValues,
  fileValueSchema,
  getFormFileFieldInitialData,
  toast
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

const schema = z.object({
  month: z.number().min(1, 'Required').max(12),
  year: z.number().int('Must be a valid year'),
  previous_meter_reading: z.number().nonnegative(),
  current_meter_reading: z.number().nonnegative(),
  electricity_rate: z.number().nonnegative(),
  utility_bill: z.number().nonnegative(),
  rental_fee: z.number().nonnegative(),
  amount_paid: z.number().nonnegative(),
  auto_create_wallet_transaction: z.boolean().optional(),
  wallet_entry_id: z.string().optional().catch(''),
  electricity_used: z.number().optional(),
  meter_reading_image: fileValueSchema.optional(),
  bank_statement: fileValueSchema.optional()
})

export default function ModifyPaymentEntryModal({
  onClose,
  data: { openType, initialData }
}: {
  onClose: () => void
  data: {
    openType: 'create' | 'update'
    initialData?: import('@').PaymentEntry
  }
}) {
  const { t } = useTranslation('apps.melvinchia3636--rental-payment-tracker')

  const qc = useQueryClient()

  const settingsQuery = useQuery(forgeAPI.settings.get.queryOptions())

  const entriesQuery = useQuery(forgeAPI.entries.list.queryOptions())

  const mutation = useMutation(
    (openType === 'create'
      ? forgeAPI.entries.create
      : forgeAPI.entries.update.input({
          id: initialData!.id!
        })
    ).mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: ['melvinchia3636--rentalPaymentTracker']
        })
        qc.invalidateQueries({ queryKey: ['wallet'] })
      },
      onError: error => {
        toast.error('Failed to submit payment entry.')
        console.error('Error submitting form:', error)
      }
    })
  )

  const currentDate = new Date()

  const lastEntry = entriesQuery.data?.[0]

  const previousMeterReading =
    initialData?.previous_meter_reading ??
    lastEntry?.current_meter_reading ??
    settingsQuery.data?.initial_meter_reading ??
    0

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      previous_meter_reading: previousMeterReading,
      current_meter_reading: 0,
      electricity_rate: settingsQuery.data?.electricity_rate ?? 0,
      utility_bill: settingsQuery.data?.utility_bill ?? 0,
      rental_fee: settingsQuery.data?.rental_fee ?? 0,
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
    },
    resolver: zodResolver(schema)
  })

  const [
    watchedCurrent,
    watchedPrevious,
    electricityRate,
    utilityBill,
    rentalFee
  ] = useWatch({
    control: form.control,
    name: [
      'current_meter_reading',
      'previous_meter_reading',
      'electricity_rate',
      'utility_bill',
      'rental_fee'
    ]
  })

  const electricityUsed = Math.max(
    0,
    (watchedCurrent ?? 0) - (watchedPrevious ?? 0)
  )

  const electricityBill = electricityUsed * (electricityRate ?? 0)

  const totalPayable = (rentalFee ?? 0) + (utilityBill ?? 0) + electricityBill

  if (!settingsQuery.data || !entriesQuery.data) {
    return null
  }

  const settings = settingsQuery.data

  return (
    <FormModal
      form={form}
      submissionConfig={{
        template: openType === 'create' ? 'create' : 'update',
        handler: async formData => {
          const electricityUsed =
            formData.current_meter_reading - formData.previous_meter_reading

          const { bank_statement, meter_reading_image, ...rest } = formData

          await mutation.mutateAsync({
            ...rest,
            month: formData.month!,
            electricity_used: electricityUsed,
            bank_statement: convertFormFileFieldData(bank_statement),
            meter_reading_image: convertFormFileFieldData(meter_reading_image),
            wallet_entry_id: rest.wallet_entry_id || ''
          })
        }
      }}
      uiConfig={{
        icon: 'tabler:receipt',
        title: `payment.${openType}`,
        namespace: 'apps.melvinchia3636--rental-payment-tracker',
        onClose
      }}
    >
      <ListboxField
        required
        control={form.control}
        icon="tabler:calendar-month"
        label="Month"
        name="month"
        options={Array.from({ length: 12 }, (_, i) => ({
          text: t(`common.misc:dates.months.${i}`),
          value: i + 1
        }))}
      />
      <NumberField
        required
        control={form.control}
        icon="tabler:calendar"
        label="Year"
        name="year"
      />
      <NumberField
        required
        control={form.control}
        icon="tabler:gauge"
        label="Previous Meter Reading"
        name="previous_meter_reading"
      />
      <NumberField
        required
        control={form.control}
        icon="tabler:gauge"
        label="Current Meter Reading"
        name="current_meter_reading"
      />
      <Flex align="center" bg="bg-100" gap="xs" justify="between" p="md" r="md">
        <Flex direction="column" width="100%">
          <Text>{t('paymentCard.totalPayable')}</Text>
          <Text color="custom-500" size="xl" weight="bold">
            RM {totalPayable.toFixed(2)}
          </Text>
        </Flex>
        <Flex direction="column" justify="end">
          <Text color="muted" whiteSpace="nowrap">
            ({electricityUsed} kWh × RM {(electricityRate ?? 0).toFixed(2)}) =
            RM {electricityBill.toFixed(2)} +
          </Text>
          <Text align="right" color="muted" whiteSpace="nowrap">
            RM {(rentalFee ?? 0).toFixed(2)} + RM{' '}
            {(utilityBill ?? 0).toFixed(2)}
          </Text>
        </Flex>
      </Flex>
      <Flex align="center" gap="md">
        <NumberField
          required
          control={form.control}
          disabled={openType === 'update' && !!initialData?.wallet_entry_id}
          icon="tabler:cash"
          label="Amount Paid"
          name="amount_paid"
        />
        {openType === 'update' && !!initialData?.wallet_entry_id && (
          <Tooltip icon="tabler:link" id="amount-paid-disabled">
            <Box maxWidth="20em">
              {t('empty.transactionLinked.description')}
            </Box>
          </Tooltip>
        )}
      </Flex>
      <FileField
        control={form.control}
        icon="tabler:photo"
        label="Meter Reading Image"
        mimeTypes={{ image: ['png', 'jpeg', 'webp'] }}
        name="meter_reading_image"
      />
      <FileField
        control={form.control}
        icon="tabler:report-money"
        label="Bank Statement"
        mimeTypes={{
          image: ['png', 'jpeg', 'webp'],
          application: ['pdf']
        }}
        name="bank_statement"
      />
      {openType === 'create' &&
        settings.link_with_wallet &&
        settings.wallet_template_id && (
          <CheckboxField
            control={form.control}
            icon="tabler:wallet"
            label="Auto create Wallet Transaction"
            name="auto_create_wallet_transaction"
          />
        )}
    </FormModal>
  )
}
