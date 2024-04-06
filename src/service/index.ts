import { mapLimit } from "async"

import { PokeApiClient, idFromPokemonUrl } from "../clients/pokeapi"
import { Repository } from "../db/repository"
import { Pokemon, PokemonListItem } from "../types"
import { Logger } from "pino"

interface Dependencies {
  logger: Logger
  pokeapiClient: PokeApiClient
  repository: Repository
}

interface Service {
  indexPokemon: (reInitialize: boolean) => Promise<void>
  getPokemon: (id: number) => Promise<Pokemon>
}

export function initService(deps: Dependencies): Service {
  const { logger, pokeapiClient, repository } = deps

  async function _getAllPokemonListItems() {
    const pokemonList: PokemonListItem[] = []
    let offset = 0
    let limit = 1000

    while (true) {
      const page = await pokeapiClient.list({ offset, limit })
      pokemonList.push(...page.results)

      if (page.next === null) {
        break
      }
      offset += limit
    }

    return pokemonList
  }

  async function indexPokemon(reInitialize: boolean) {
    logger.info({ reInitialize }, "Indexing pokemon")

    const [apiPokemonListItems, existingPokemonIds] = await Promise.all([
      _getAllPokemonListItems(),
      repository.listPokemonIds(),
    ])

    const existingIds = new Set(existingPokemonIds)
    const newListed = apiPokemonListItems.filter((item) => !existingIds.has(idFromPokemonUrl(item.url)))

    const toFetch = reInitialize ? apiPokemonListItems : newListed
    const pokemon: Pokemon[] = await mapLimit(toFetch, 10, async (item: PokemonListItem) => {
      return await pokeapiClient.getByUrl(item.url)
    })

    if (pokemon.length === 0) {
      logger.info("No new pokemon found, pokemon are up to date!")
      return
    }

    logger.info({ pokemonCount: pokemon.length }, "Found pokemon, persisting...")

    // updated will be empty if we're not re-initializing.
    const toUpdate = pokemon.filter((p) => existingIds.has(p.id))
    const toCreate = pokemon.filter((p) => !existingIds.has(p.id))

    if (toUpdate.length > 0) {
      await repository.updatePokemon(...toUpdate)
    }
    if (toCreate.length > 0) {
      await repository.createPokemon(...toCreate)
    }

    logger.info({ updated: toUpdate.length, created: toCreate.length }, "Pokemon indexed")
  }

  async function getPokemon(id: number) {
    return await repository.getPokemon(id)
  }

  return {
    indexPokemon,
    getPokemon,
  }
}
