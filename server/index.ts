import { forgeRouter, writeContractFileToClient } from '@lifeforge/server-utils'

import * as entriesRoutes from './routes/entries'
import * as settingsRoutes from './routes/settings'

const routes = forgeRouter({
  entries: entriesRoutes,
  settings: settingsRoutes
})

writeContractFileToClient(routes, import.meta.dirname)

export default routes
