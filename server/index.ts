import { forgeRouter, writeContractFileToClient } from '@lifeforge/server-utils'

import * as entriesRoutes from './routes/entries'
import * as settingsRoutes from './routes/settings'
import * as walletRoutes from './routes/wallet'

const routes = forgeRouter({
  entries: entriesRoutes,
  settings: settingsRoutes,
  wallet: walletRoutes
})

writeContractFileToClient(routes, import.meta.dirname)

export default routes
