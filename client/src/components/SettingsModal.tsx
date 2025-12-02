import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormModal, defineForm } from 'lifeforge-ui'
import { useTranslation } from 'react-i18next'
import type { InferInput } from 'shared'

import forgeAPI from '../utils/forgeAPI'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('apps.rentalPaymentTracker')

  const qc = useQueryClient()

  const settingsQuery = useQuery(
    forgeAPI.rentalPaymentTracker.settings.get.queryOptions()
  )

  const walletAvailabilityQuery = useQuery(
    forgeAPI.modules.checkModuleAvailability
      .input({
        moduleId: 'wallet'
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
    forgeAPI.rentalPaymentTracker.settings.update.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['rentalPaymentTracker', 'settings'] })
        onClose()
      }
    })
  )

  console.log('walletTemplatesQuery.data', walletTemplatesQuery.data)

  if (!settingsQuery.data) {
    return null
  }

  const { formProps } = defineForm<
    InferInput<typeof forgeAPI.rentalPaymentTracker.settings.update>['body']
  >({
    title: 'Settings',
    icon: 'tabler:settings',
    namespace: 'apps.rentalPaymentTracker',
    loading: walletAvailabilityQuery.isLoading,
    onClose,
    submitButton: {
      icon: 'tabler:device-floppy',
      children: 'Save'
    }
  })
    .typesMap({
      initial_prepayment: 'currency',
      initial_meter_reading: 'number',
      electricity_rate: 'currency',
      utility_bill: 'currency',
      rental_fee: 'currency',
      link_with_wallet: 'checkbox',
      wallet_template_id: 'listbox'
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
      },
      link_with_wallet: {
        disabled: walletAvailabilityQuery.data === false,

        disabledReason: (
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Icon className="size-5" icon="tabler:apps-off" />
              {t('empty.walletModule.title')}
            </h3>
            <p className="text-bg-500">{t('empty.walletModule.description')}</p>
          </div>
        ),
        label: 'Link with Wallet Module',
        icon: 'tabler:wallet'
      },
      wallet_template_id: {
        label: 'Wallet Template',
        icon: 'tabler:template',
        multiple: false,
        disabled: walletTemplatesQuery.data?.expenses.length === 0,
        disabledReason: (
          <div className="w-72">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Icon className="size-5 shrink-0" icon="tabler:template-off" />
              {t('empty.walletTemplates.title')}
            </h3>
            <p className="text-bg-500">
              {t('empty.walletTemplates.description')}
            </p>
          </div>
        ),
        options:
          walletCategoriesQuery.data && walletTemplatesQuery.data
            ? walletTemplatesQuery.data?.expenses.map(template => ({
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
            : [],
        required: true
      }
    })
    .conditionalFields({
      wallet_template_id: formData => formData.link_with_wallet === true
    })
    .initialData(settingsQuery.data)
    .onSubmit(async data => {
      await mutation.mutateAsync(data)
    })
    .build()

  return <FormModal {...formProps} />
}
