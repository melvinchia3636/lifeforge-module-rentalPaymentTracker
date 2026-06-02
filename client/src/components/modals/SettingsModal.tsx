import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import z from 'zod'

import {
  CheckboxField,
  CurrencyField,
  Flex,
  FormModal,
  ListboxField,
  NumberField,
  Tooltip,
  createDefaultValues
} from '@lifeforge/ui'

import forgeAPI from '../../utils/forgeAPI'

const schema = z.object({
  initial_prepayment: z.number().nonnegative(),
  initial_meter_reading: z.number().nonnegative(),
  electricity_rate: z.number().nonnegative(),
  utility_bill: z.number().nonnegative(),
  rental_fee: z.number().nonnegative(),
  link_with_wallet: z.boolean(),
  wallet_template_id: z.string().optional()
})

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('apps.melvinchia3636$rentalPaymentTracker')

  const qc = useQueryClient()

  const settingsQuery = useQuery(forgeAPI.settings.get.queryOptions())

  const walletAvailabilityQuery = useQuery(
    forgeAPI
      .checkModuleAvailability({
        moduleId: 'lifeforge--wallet'
      })
      .queryOptions()
  )

  const walletTemplatesQuery = useQuery<{
    expenses: {
      id: string
      name: string
      category: string
    }[]
  }>(
    forgeAPI.untyped('/wallet/templates/list').queryOptions({
      enabled: walletAvailabilityQuery.data === true
    })
  )

  const walletCategoriesQuery = useQuery<
    {
      id: string
      name: string
      color: string
      icon: string
      type: 'income' | 'expenses'
    }[]
  >(
    forgeAPI.untyped('/wallet/categories/list').queryOptions({
      enabled: walletAvailabilityQuery.data === true
    })
  )

  const mutation = useMutation(
    forgeAPI.settings.update.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: ['melvinchia3636--rentalPaymentTracker', 'settings']
        })
        onClose()
      }
    })
  )

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      ...settingsQuery.data
    },
    resolver: zodResolver(schema)
  })

  const linkWithWallet = useWatch({
    control: form.control,
    name: 'link_with_wallet'
  })

  if (!settingsQuery.data) {
    return null
  }

  const walletOptions =
    walletCategoriesQuery.data && walletTemplatesQuery.data
      ? walletTemplatesQuery.data.expenses.map(template => ({
          label: `${template.name} [${template.category}]`,
          value: template.id,
          color: walletCategoriesQuery.data.find(
            category => category.id === template.category
          )?.color,
          icon: walletCategoriesQuery.data.find(
            category => category.id === template.category
          )?.icon,
          text: template.name
        }))
      : []

  return (
    <FormModal
      form={form}
      submissionConfig={{
        label: 'Save',
        icon: 'tabler:device-floppy',
        handler: mutation.mutateAsync
      }}
      uiConfig={{
        icon: 'tabler:settings',
        title: 'Settings',
        namespace: 'apps.melvinchia3636$rentalPaymentTracker',
        loading: walletAvailabilityQuery.isLoading,
        onClose
      }}
    >
      <CurrencyField
        required
        control={form.control}
        icon="tabler:cash-plus"
        label="Initial Prepayment Balance"
        name="initial_prepayment"
      />
      <NumberField
        required
        control={form.control}
        icon="tabler:gauge"
        label="Initial Meter Reading"
        name="initial_meter_reading"
      />
      <CurrencyField
        required
        control={form.control}
        icon="tabler:bolt"
        label="Electricity Rate"
        name="electricity_rate"
      />
      <CurrencyField
        required
        control={form.control}
        icon="tabler:droplet-dollar"
        label="Utility Bill"
        name="utility_bill"
      />
      <CurrencyField
        required
        control={form.control}
        icon="tabler:home-dollar"
        label="Rental Fee"
        name="rental_fee"
      />
      <Flex align="center" gap="md">
        <CheckboxField
          control={form.control}
          disabled={!walletAvailabilityQuery.data}
          icon="tabler:wallet"
          label="Link with Wallet Module"
          name="link_with_wallet"
        />
        {!walletAvailabilityQuery.data && (
          <Tooltip icon="tabler:info-circle" id="wallet-module-disabled">
            {t('empty.walletModule.description')}
          </Tooltip>
        )}
      </Flex>
      {linkWithWallet && (
        <Flex align="center" gap="md">
          <ListboxField
            required
            control={form.control}
            disabled={walletTemplatesQuery.data?.expenses.length === 0}
            icon="tabler:template"
            label="Wallet Template"
            name="wallet_template_id"
            options={walletOptions}
          />
          {walletTemplatesQuery.data?.expenses.length === 0 && (
            <Tooltip icon="tabler:info-circle" id="wallet-templates-disabled">
              {t('empty.walletTemplates.description')}
            </Tooltip>
          )}
        </Flex>
      )}
    </FormModal>
  )
}
