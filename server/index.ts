import { forgeRouter } from '@functions/routes'

import * as entriesRoutes from './routes/entries'
import settingsRoutes from './routes/settings'

export default forgeRouter({
  entries: entriesRoutes,
  settings: settingsRoutes
})
