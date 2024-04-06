import dotenv from "dotenv"
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

  logger.info("Starting app")

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

  try {
    await service.indexPokemon(false)
  } catch (err) {
    if (config.strictIndexing) {
      throw err
    }

    logger.error({ err }, "Failed to index pokemon")
    const ids = await repository.listPokemonIds()
    if (ids.length === 0) {
      // There's no data, can't run in possibly partial state.
      throw err
    }

    logger.warn({ pokemonCount: ids.length }, "Pokemon data may be incomplete, continuing with what we have")
  }

  const app = await setupApp({
    logger: logger.child({ app: "router" }),
    service: service,
  })
  const server = await run({ host: config.host, port: config.port }, app)

  logger.info({ port: config.port }, "Server started")

  createTerminus(server, {
    signals: ["SIGINT", "SIGTERM"],
    healthChecks: {
      "/status": async () => ({ status: "ok" }),
    },
    timeout: config.gracefulShutdown.timeout,
    onSignal: async () => {
      logger.info("Server is starting cleanup")
      await setTimeout(config.gracefulShutdown.shutdownDelay)

      logger.info("Cleanup finished, server is shutting down")
    },
    onShutdown: async () => {
      logger.info("Server is shutting down")
    },
  })
}

init().catch((err) => {
  _logger.error({ err }, "Failed to start app, shutting down")
  process.exit(1)
})
