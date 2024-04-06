import { Connection } from "mongoose"

import Pokemon from "./models/pokemon"

export default function initDb(connection: Connection) {
  return {
    connection,
    models: {
      Pokemon: Pokemon(connection),
    },
  }
}
