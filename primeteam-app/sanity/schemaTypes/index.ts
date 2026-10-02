// Catalogs
import country from './catalogs/country'
import port from './catalogs/port'
import shippingLine from './catalogs/shippingLine'
import service from './catalogs/service'
import terminal from './catalogs/terminal'
import vessel from './catalogs/vessel'
import person from './catalogs/person'
import region from './catalogs/region'

// Operations & Configuration
import route from './operations/route'
import itinerary from './operations/itinerary'
import routeDirectory from './operations/routeDirectory'
import routeLineUpdate from './operations/routeLineUpdate'
import voyage from './operations/voyage'
import routeLineConfig from './operations/routeLineConfig'
import uploadHistory from './operations/uploadHistory'
import itinerarySendout from './operations/itinerarySendout'

export const schemaTypes = [
  // Catalogs
  country,
  port,
  shippingLine,
  service,
  terminal,
  vessel,
  person,
  region,
  // Operations & Configuration
  route,
  itinerary,
  routeDirectory,
  routeLineUpdate,
  voyage,
  routeLineConfig,
  uploadHistory,
  itinerarySendout,
]
