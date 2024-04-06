import createLogger, { stdSerializers } from "pino"

export interface Config {
  host: string
  port: number

  gracefulShutdown: {
    shutdownDelay: number
    timeout: number
  }

  logger: {
    level: string
  }

  mongoUri: string

  pokeapiUri: string
  strictIndexing: boolean
}

export const setupLogger = (level: string) => {
  return createLogger({
    level,
    serializers: {
      err: stdSerializers.err,
      req: stdSerializers.req,
      res: stdSerializers.res,
    },
  })
}

export default function getConfig(): Config {
  return {
    host: process.env.HOST ?? "0.0.0.0",
    port: parseInt(process.env.PORT ?? "3000", 10),
    gracefulShutdown: {
      timeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT ?? "30000", 10),
      shutdownDelay: parseInt(process.env.GRACEFUL_SHUTDOWN_DELAY ?? "15000", 10),
    },
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
    mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017",
    pokeapiUri: process.env.POKEAPI_URI ?? "https://pokeapi.co",
    strictIndexing: process.env.POKEAPI_STRICT_INDEXING === "true",
  }
}
