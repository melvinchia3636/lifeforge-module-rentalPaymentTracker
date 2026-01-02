import { lazy } from 'react'
import type { ModuleConfig } from 'shared'

export default {
  name: 'Rental Payment Tracker',
  icon: 'tabler:receipt',
  routes: {
    '/': lazy(() => import('@'))
  },
  category: 'Finance'
} satisfies ModuleConfig
