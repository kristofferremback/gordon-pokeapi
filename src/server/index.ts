import http from "http"

import express, { Express, Request, Response } from "express"
import { pinoHttp } from "pino-http"

interface ServerConfig {
  host: string
  port: number
}

export async function setupApp(): Promise<Express> {
  const app = express()

  app.use(express.json())
  app.use(pinoHttp())

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!")
  })

  return app
}

export async function run(config: ServerConfig, app: Express): Promise<http.Server> {
  const server = await http.createServer(app)

  await server.listen(config.port, config.host)

  return server
}
