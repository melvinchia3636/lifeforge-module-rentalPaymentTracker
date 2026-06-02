import { createForgeProxy } from '@lifeforge/shared'

import contract from '@/contract'

if (!(window as any).VITE_API_HOST) {
  throw new Error('VITE_API_HOST is not defined')
}

const forgeAPI = createForgeProxy(
  contract,
  import.meta.env.VITE_API_HOST || (window as any).VITE_API_HOST,
  'melvinchia3636--rentalPaymentTracker'
)

export default forgeAPI
