import { v4 as uuid } from "uuid"
import mongoose, { Connection } from "mongoose"

import initDb from "./index"
import initRepository from "./repository"
import { Pokemon } from "../types"

describe("repository", () => {
  const mongooseUri = process.env.MONGO_URI as string

  let connection: Connection
  let db: ReturnType<typeof initDb>

  beforeAll(async () => {
    const dbName = `test-${Date.now()}-${uuid()}`
    connection = await mongoose.createConnection(mongooseUri).useDb(dbName)

    db = initDb(connection)
  })

  afterAll(async () => {
    connection.close()
  })

  // Since there isn't much behind he scenes, a simple integration test is effective.
  describe("integration test", () => {
    it("should support creating, getting, updating, and listing pokemon", async () => {
      const repository = initRepository({ models: db.models })

      const bulbasaur = { id: 1, name: "bulbasaur", base_experience: 64 /* ... more fields  */ } as Pokemon // Trust me
      const ivysaur = { id: 2, name: "ivysaur", base_experience: 142 /* ... more fields  */ } as Pokemon // Trust me
      const venusaur = { id: 3, name: "venusaur", base_experience: 236 /* ... more fields  */ } as Pokemon // Trust me

      // We can save pokemon
      await repository.createPokemon(bulbasaur, ivysaur, venusaur)

      // And we can step through to get them all
      const wantListedPokemon = [bulbasaur, ivysaur, venusaur]
      const listedPokemon: Pokemon[] = []
      while (listedPokemon.length < wantListedPokemon.length) {
        const page = await repository.listPokemon({ offset: listedPokemon.length, limit: 2 })

        listedPokemon.push(...page.items)
      }
      expect(listedPokemon).toEqual(wantListedPokemon)

      // We can list all ids
      const ids = await repository.listPokemonIds()
      expect(ids).toEqual(wantListedPokemon.map((p) => p.id))

      // We can update them
      const updated = listedPokemon.map((p) => ({ ...p, base_experience: p.base_experience + 1 }))
      await repository.updatePokemon(...updated)

      // And we can update them using PATCH semantics
      const patchUpdates = updated.map((p) => ({ id: p.id, name: `${p.name}-updated` }))
      const wantUpdatedAndPatched = updated.map((p, i) => ({ ...p, name: patchUpdates[i].name }))
      await repository.updatePokemon(...patchUpdates)

      // We can get them by id
      const gotUpdatedAndPatched: Pokemon[] = []
      for (const p of wantUpdatedAndPatched) {
        gotUpdatedAndPatched.push(await repository.getPokemon(p.id))
      }
      // And they should be both updated and patched
      expect(gotUpdatedAndPatched).toEqual(wantUpdatedAndPatched)
    })
  })
})
