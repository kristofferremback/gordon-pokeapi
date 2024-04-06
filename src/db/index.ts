import { Mongoose } from "mongoose"

import Pokemon from "./models/pokemon"

export default function initDb(mongoose: Mongoose) {
  return {
    mongoose,
    models: {
      Pokemon: Pokemon(mongoose),
    },
  }
}
