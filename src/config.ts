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
  }
}
