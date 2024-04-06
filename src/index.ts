import dotenv from "dotenv"
import createLogger, { Logger } from "pino"
import { setTimeout } from "timers/promises"
import { createTerminus } from "@godaddy/terminus"

import getConfig from "./config"
import { setupApp, run } from "./server"

let log: Logger = console

async function init() {
  const dotenvPath = process.env.DOTENV_PATH ?? ".env"
  dotenv.config({ path: dotenvPath })

  const config = getConfig()

  const logger = createLogger({ level: config.logger.level })
  // Register the global logger so it can be used in case of errors when initializing the app
  log = logger

  logger.info("starting app")

  const app = await setupApp()
  const server = await run({ host: config.host, port: config.port }, app)

  logger.info({ port: config.port }, "server started")

  createTerminus(server, {
    signals: ["SIGINT", "SIGTERM"],
    healthChecks: {
      "/status": async () => ({ status: "ok" }),
    },
    timeout: config.gracefulShutdown.timeout,
    onSignal: async () => {
      logger.info("server is starting cleanup")
      await setTimeout(config.gracefulShutdown.shutdownDelay)

      logger.info("cleanup finished, server is shutting down")
    },
    onShutdown: async () => {
      logger.info("server is shutting down")
    },
  })
}

init().catch((err) => {
  log.error("failed to start app, shutting down", err)
  process.exit(1)
})
