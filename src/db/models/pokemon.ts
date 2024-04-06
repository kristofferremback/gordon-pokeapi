import { Connection, Schema } from "mongoose"

export default function (conn: Connection) {
  const pokemonSchema = new Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true },
    // TODO: Would we want to improve the schema a bit?
    // Given the currently small amount of data (2024-04-06),
    // indexing is overkill and will work just fine without it.
    raw_pokemon: { type: Schema.Types.Mixed, required: true },
  })

  const Pokemon = conn.model("Pokemon", pokemonSchema)

  return Pokemon
}
