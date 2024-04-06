import dotenv from "dotenv"
import createLogger, { Logger, stdSerializers } from "pino"
import { setTimeout } from "timers/promises"
import { createTerminus } from "@godaddy/terminus"
import axios from "axios"

import getConfig, { setupLogger } from "./config"
import { setupApp, run } from "./server"
import initDb from "./db"
import mongoose from "mongoose"
import initRepository from "./db/repository"
import { initService } from "./service"
import { createPokeapiClient } from "./clients/pokeapi"

// Set up global logger in case things goes wrong before
// we've initialized the application logger.
let _logger = setupLogger("info")

async function init() {
  const dotenvPath = process.env.DOTENV_PATH ?? ".env"
  dotenv.config({ path: dotenvPath })

  const config = getConfig()

  const logger = setupLogger(config.logger.level)
  // Register the global logger so it can be used in case of errors when initializing the app
  _logger = logger

  logger.info("starting app")

  await mongoose.connect(config.mongoUri)
  const db = initDb(mongoose)
  const repository = initRepository({ models: db.models })

  const pokeapiClient = createPokeapiClient({
    client: axios.create({ baseURL: config.pokeapiUri }),
    logger: logger.child({ client: "pokeapi" }),
  })

  const service = initService({
    logger: logger.child({ service: "pokemon" }),
    pokeapiClient: pokeapiClient,
    repository: repository,
  })

  await service.indexPokemon()

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
  _logger.error({ err }, "failed to start app, shutting down")
  process.exit(1)
})
