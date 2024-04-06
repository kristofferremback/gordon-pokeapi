import { Page, Pokemon } from "../types"

export interface Repository {
  getPokemon: (id: number) => Promise<Pokemon>
  listPokemon: ({ offset, limit }: { offset: number; limit: number }) => Promise<Page<Pokemon>>
  listPokemonIds: () => Promise<number[]>
  createPokemon: (...pokemon: Pokemon[]) => Promise<void>
  updatePokemon: (...pokemon: Partial<Pokemon>[]) => Promise<void>
}

export interface Depencies {
  models: {
    Pokemon: ReturnType<typeof import("./models/pokemon").default>
  }
}

export default function initRepository({ models }: Depencies): Repository {
  const getPokemon = async (id: number) => {
    const doc = await models.Pokemon.findOne({ id })
    if (doc == null) {
      throw new Error(`Pokemon with id ${id} not found`)
    }

    return doc.raw_pokemon as Pokemon
  }

  const listPokemon = async ({ offset, limit }: { offset: number; limit: number }) => {
    // TODO: Validate the offset and limit
    const [docs, totalCount] = await Promise.all([
      models.Pokemon.find().sort({ id: 1 }).skip(offset).limit(limit),
      models.Pokemon.countDocuments(),
    ])

    return {
      items: docs.map((doc) => doc.raw_pokemon as Pokemon),
      total: totalCount,
    }
  }

  const listPokemonIds = async () => {
    const docs = await models.Pokemon.find().sort({ id: 1 })
    return docs.map((doc) => doc.id as number)
  }

  const createPokemon = async (...pokemon: Pokemon[]) => {
    const docs = pokemon.map((p) => new models.Pokemon({ id: p.id, name: p.name, raw_pokemon: p }))
    await models.Pokemon.bulkSave(docs)
  }

  const updatePokemon = async (...pokemon: Partial<Pokemon>[]) => {
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

      if (p.name && p.name !== doc.name) {
        doc.name = p.name
      }

      // Shallow merge.
      doc.raw_pokemon = { ...doc.raw_pokemon, ...p }
    }

    await models.Pokemon.bulkSave(docs)
  }

  return {
    listPokemon,
    listPokemonIds,
    getPokemon,
    createPokemon,
    updatePokemon,
  }
}
