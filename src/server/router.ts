import { Request, Response, Router } from "express"
import PromiseRouter from "express-promise-router"

import { Pokemon } from "../types"
import { Dependencies } from "./types"

export function setupRouter(deps: Dependencies): Router {
  const router = PromiseRouter()

  router.get("/pokemon/", listPokemon(deps))
  router.post("/pokemon/", createPokemon(deps))
  router.get("/pokemon/:id", getPokemon(deps))

  // PUT with PATCH semantics
  router.put("/pokemon/:id", updatePokemon(deps))

  return router
}

// These could be moved in to another file but now it feels superfluous to do so.

function listPokemon({ service }: Dependencies) {
  return async (req: Request, res: Response) => {
    const query = req.query as { limit?: string; offset?: string }

    // TODO: Validate limit and offset
    const limit = query.limit ? parseInt(query.limit) : undefined
    const offset = query.offset ? parseInt(query.offset) : undefined

    const pokemon = await service.listPokemon({ limit, offset })

    res.json(pokemon)
  }
}

function getPokemon({ service }: Dependencies) {
  return async (req: Request, res: Response) => {
    // TODO: Validate id
    const id = parseInt(req.params.id)

    const pokemon = await service.getPokemon(id)
    if (!pokemon) {
      res.status(404).json({ error: "Pokemon not found" })
      return
    }

    res.json(pokemon)
  }
}

function createPokemon({ service }: Dependencies) {
  return async (req: Request, res: Response) => {
    // TODO: Validate pokemon
    const toCreate = req.body as Pokemon

    // TODO: Handle unique constraint errors and respond with conflict.
    const pokemon = await service.createPokemon(toCreate)

    return res.status(200).json(pokemon)
  }
}

function updatePokemon({ service }: Dependencies) {
  return async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    // TODO: Separate domain and incoming data.
    const toUpate = req.body as Pokemon

    if (toUpate.id == null) {
      // It's OK not to provide it
      toUpate.id = id
    } else if (toUpate.id != id) {
      return res.status(400).json({ error: "ID in path does not match ID in body" })
    }

    const pokemon = await service.updatePokemon(toUpate)

    return res.status(200).json(pokemon)
  }
}
