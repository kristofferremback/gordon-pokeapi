import { Axios } from "axios"
import { Pokemon, PokemonListResult } from "../../types"
import { Logger } from "pino"

export interface PokeApiClient {
  list: ({ offset, limit }: { offset: number; limit: number }) => Promise<PokemonListResult>
  getByUrl: (url: string) => Promise<Pokemon>
}

export interface Dependencies {
  client: Axios
  logger: Logger
}

export const createPokeapiClient = ({ client, logger }: Dependencies): PokeApiClient => {
  if (!client) {
    throw new Error("Client is required")
  }

  const baseUri = client.getUri()
  logger.debug({ baseUri }, "Pokeapi client initialized")

  return {
    list: async ({ offset, limit }: { offset: number; limit: number }) => {
      logger.debug({ offset, limit }, "Listing pokemon")

      const response = await client.get<PokemonListResult>(`/api/v2/pokemon`, {
        params: {
          offset,
          limit,
        },
      })

      logger.debug({ count: response.data.results.length }, "Listed pokemon")
      return response.data
    },
    getByUrl: async (url: string) => {
      logger.debug({ url }, "Fetching pokemon")

      if (!url.startsWith(baseUri)) {
        throw new Error(`Invalid url, must start with ${baseUri}`)
      }

      const response = await client.get<Pokemon>(url.slice(baseUri.length))
      return response.data
    },
  }
}

export function idFromPokemonUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/$/)
  if (match == null) {
    throw new Error(`Invalid url: ${url}`)
  }

  return parseInt(match[1])
}
