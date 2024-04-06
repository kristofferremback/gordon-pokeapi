import { Page, Pokemon } from "../types"

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T

export interface Repository {
  getPokemon: (id: number) => Promise<Pokemon>
  listPokemon: ({ offset, limit }: { offset: number; limit: number }) => Promise<Page<Pokemon>>
  listPokemonIds: () => Promise<number[]>
  createPokemon: (...pokemon: Pokemon[]) => Promise<void>
  updatePokemon: (...pokemon: Pokemon[]) => Promise<void>
}

export interface Depencies {
  models: {
    Pokemon: ReturnType<typeof import("./models/pokemon").default>
  }
}

export default function initRepository({ models }: Depencies): Repository {
  return {
    getPokemon: async (id: number) => {
      const doc = await models.Pokemon.findOne({ id })
      if (doc == null) {
        throw new Error(`Pokemon with id ${id} not found`)
      }

      return doc.raw_pokemon as Pokemon
    },
    listPokemonIds: async () => {
      const docs = await models.Pokemon.find()
      return docs.map((doc) => doc.id as number)
    },
    listPokemon: async ({ offset, limit }) => {
      // TODO: Validate inputs
      const [docs, totalCount] = await Promise.all([
        models.Pokemon.find().skip(offset).limit(limit),
        models.Pokemon.countDocuments(),
      ])

      return {
        items: docs.map((doc) => doc.raw_pokemon as Pokemon),
        total: totalCount,
      }
    },
    createPokemon: async (...pokemon: Pokemon[]) => {
      const docs = pokemon.map((p) => new models.Pokemon({ id: p.id, name: p.name, raw_pokemon: p }))
      await models.Pokemon.bulkSave(docs)
    },
    updatePokemon: async (...pokemon: Pokemon[]) => {
      const docs = await models.Pokemon.find({ id: { $in: pokemon.map((p) => p.id) } })
      if (docs.length !== pokemon.length) {
        // Could improve the error here, but that's for another time.
        throw new Error(`Not all pokemon found in database`)
      }

      const updateMap = new Map(docs.map((doc) => [doc.id, doc]))
      for (const p of pokemon) {
        const doc = updateMap.get(p.id)
        if (doc == null) {
          throw new Error(`Pokemon with id ${p.id} not found`)
        }

        // Shallow merge.
        doc.raw_pokemon = { ...doc.raw_pokemon, ...p }
      }

      await models.Pokemon.bulkSave(docs)
    },
  }
}
