import { Mongoose, Schema } from "mongoose"

export default function (mongoose: Mongoose) {
  const pokemonSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    // TODO: Would we want to improve the schema a bit?
    raw_pokemon: { type: Schema.Types.Mixed, required: true },
  })

  const Pokemon = mongoose.model("Pokemon", pokemonSchema)

  return Pokemon
}
