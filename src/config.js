require('dotenv').config()

import path from 'path'

const appName = "chest.store"
const hostName = process.env.HOSTNAME || "http://localhost:8080"

export default {
  apiKeyHeader: 'x-cheststore-key',

  app: {
    name: appName,
    titleCaseName: appName,
    rootDir: (function() {
      try {
        return path.join(path.dirname(require.main.filename), '..', '..')
      } catch(e) {
        return __dirname
      }
    })()
  },

  server: {
    isProduction: process.env.NODE_ENV === 'production',
    port:         process.env.PORT || 8080,
    concurrency:  parseInt(process.env.WEB_CONCURRENCY || 1),
    host:         hostName
  },

  postgres: {
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/cheststore'
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  session: {
    sessionSecret: process.env.SESSION_SECRET,
    sessionCookieKey: process.env.SESSION_COOKIE_KEY || 'cheststore'
  },

  resque: {
    default_queue: process.env.RESQUE_QUEUE || 'cheststore_resque_default',

    getAllQueues() {
      return [
        this.default_queue
      ]
    }
  },

  logger: {
    options: {
      name:   appName,
      level:  process.env.LOGGING_LEVEL || "info",
      streams: [
        {
          stream: process.stdout
        }
      ]
    }
  },

  errors: {
    '401': `You do not have access to perform this action. If you think this is a mistake contact your administrator.`,
    '403': `You do not have permission for this resource. Consider upgrading your plan to gain access to this resource or operation.`
  }
}
