import { forgeRouter } from '@lifeforge/server-utils'

import * as entriesRoutes from './routes/entries'
import * as settingsRoutes from './routes/settings'

const nice = forgeRouter({
  entries: entriesRoutes,
  settings: settingsRoutes
})

export default nice
