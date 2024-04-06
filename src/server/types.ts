import { Logger } from "pino"
import { Service } from "../service"

export interface Dependencies {
  logger: Logger
  service: Service
}
