import nock from "nock"
import axios from "axios"
import createLogger from "pino"

import { createPokeapiClient, idFromPokemonUrl } from "./index"
import { Pokemon, PokemonListResult } from "../../types"

axios.defaults.adapter = "http"

describe("PokeAPI Client", () => {
  const baseURL = "http://pokeapi.co"

  const testClient = axios.create({ baseURL })
  const noopLogger = createLogger({ level: "silent" })

  describe("client#list", () => {
    it("should list pokemon with an offset and limit", async () => {
      const want: PokemonListResult = {
        count: 3,
        next: `${baseURL}/api/v2/pokemon?offset=10&limit=10`,
        previous: null,
        results: [
          {
            name: "bulbasaur",
            url: "https://pokeapi.co/api/v2/pokemon/1/",
          },
          {
            name: "ivysaur",
            url: "https://pokeapi.co/api/v2/pokemon/2/",
          },
        ],
      }

      nock(baseURL).get("/api/v2/pokemon").query({ offset: 0, limit: 2 }).reply(200, want)

      const apiClient = createPokeapiClient({ client: testClient, logger: noopLogger })

      const got = await apiClient.list({ offset: 0, limit: 2 })
      expect(got).toEqual(want)
    })

    // TODO: Add more tests
  })

  describe("client#getByUrl", () => {
    it("should fetch a pokemon by url", async () => {
      const want = {
        id: 1,
        name: "bulbasaur",
        // ... more fields
      } as Pokemon // Trust me

      nock(baseURL).get("/api/v2/pokemon/1/").reply(200, want)

      const apiClient = createPokeapiClient({ client: testClient, logger: noopLogger })

      const got = await apiClient.getByUrl(`${baseURL}/api/v2/pokemon/1/`)
      expect(got).toEqual(want)
    })

    // TODO: Add more tests
  })

  describe("idFromPokemonUrl", () => {
    it("should extract the id from a pokemon url", () => {
      const url = "https://pokeapi.co/api/v2/pokemon/1/"

      expect(idFromPokemonUrl(url)).toEqual(1)
    })

    it("should throw an error for an invalid url", () => {
      const url = "https://pokeapi.co/api/v2/pokemon/bulbasaur/"

      expect(() => idFromPokemonUrl(url)).toThrow("Invalid url: https://pokeapi.co/api/v2/pokemon/bulbasaur/")
    })
  })
})
