import http from "http"

import express, { Express } from "express"
import { pinoHttp } from "pino-http"

import { Dependencies } from "./types"
import { setupRouter } from "./router"

interface ServerConfig {
  host: string
  port: number
}

export async function setupApp(deps: Dependencies): Promise<Express> {
  const app = express()

  app.use(express.json())
  app.use(pinoHttp())

  app.use(setupRouter(deps))

  return app
}

export async function run(config: ServerConfig, app: Express): Promise<http.Server> {
  const server = await http.createServer(app)

  await server.listen(config.port, config.host)

  return server
}
