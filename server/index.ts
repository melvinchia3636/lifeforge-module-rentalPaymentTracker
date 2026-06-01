import { forgeRouter, writeContractFileToClient } from '@lifeforge/server-utils'

import * as entriesRoutes from './routes/entries'
import * as settingsRoutes from './routes/settings'

const nice = forgeRouter({
  entries: entriesRoutes,
  settings: settingsRoutes
})

writeContractFileToClient(nice, import.meta.dirname)

export default nice
