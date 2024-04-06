# gordon-pokeapi

## Reflection

Overall, once I'd gotten past setup, things went fairly smooth. Setting up TypeScript for the first time was far from painless, so I had to skip a lot of things which I found a shame, but I couldn't justify spending more time on this. I've mainly done maintenance work or added feature to already running javascript projects (barely used TypeScript in the backend at all), so setting the project up was a lot more time consuming than I'd have liked. I've set up tons of Go projects lately, but there I'm more familiar with the ecosystem (and of course my current team's way of working), so setting up a TypeScript backend was a learning experience for sure!

Most of my time has been spent searching for _typescript X_, _jest typescript X_, I feel I've had to fight the type system far more than I'm used to with Go.

Comments:

- When it comes to data processing I would've wanted to strip out the _important bits_ and store that. I don't know much about Pokemon, so to save on time I opted for extracting the id and name (call it data processing) and then stored the raw pokemon as-is. The raw pokemon is then what's passed around in the app, but could easily be replaced with a more processed version (we have the raw data after all!)
- I opted for adding only a few tests as they take a long time to type out. Had I not been pressed for time, I would want tests for the API layer, service, and ideally some form of local end-to-end test. To save on time, I chose to add two different types of tests (to _display some possibilities_):

  - Integration test for the repository, kind of working as documentation of how to use it while still verifying it does what I want it to
  - Unit test for the pokeapi client to verify we get the data we want from it and that its components work together as expected

- There's no auth right now, but adding JWT support (assuming low-effort) would still require a bunch of typing. A fairly quick approach (but not worth it time wise due to time constraints) would be to add public+private keys with some dummy files in the repo (referenced by filepath in env file to support local/staging/prod keys) and use the public key for verification, and assuming we take a monolithic approach, the private key would be used to sign tokens. If we roll our own user management system, clients could be stored in the DB with encrypted secrets (I woulde've used bcrypt I think).
- Error handling is nice. There is some **very** basic stuff in there (and some TODOs), but overall I'm a fan of using _domain errors_ and using those throughout the app, hiding the implementation details of the error from the client. For example throwing an ErrorPokemonAlreadyExists instead of some obtuse unique constraint error from mongo and then capturing that in the API to return a 409 Conflict if someone tries to create an existing Pokemon.
- API documentation isn't really there either... I did a quick search and I couldn't find a simple _get a lot from a little_ library (think FastAPI in Python, or the less polished Huma in Go) - it seeme like it was still necessary to write out the API spec in code, comments, or plain YAML (in the few libs I looked at). I've introduced and used Fastify at my current employer (though only with JS) which back then (a few years ago) required writing the API through code (e.g. jsonschema but in JS). It does look like it may have some utilities for generating types (or schema from types?) which would be cool to test! However, the test specified Express so Fastify felt out of the picture.

## Endpoints

### `GET /pokemon`

Returns a list of all Pokemon in the database.

Example:

```bash
curl "http://localhost:3000/pokemon?offset=0&limit=1000"
```

### `GET /pokemon/:id`

Returns a single Pokemon by ID.

Example:

```bash
curl http://localhost:3000/pokemon/1
```

### `POST /pokemon`

Creates a new Pokemon.

Example:

```bash
curl -X POST http://localhost:3000/pokemon -d '{"id": 1, "name": "bulbasaur", "base_experience": 64}' -H 'Content-Type: application/json'
```

### `PUT /pokemon/:id`

Updates an existing Pokemon.

Example:

```bash
curl -X PUT http://localhost:3000/pokemon/1 -d '{"base_experience": 65}' -H 'Content-Type: application/json'
```

## Running locally

The project uses Node.js `v20.12.1` make sure you're using a compatible node version (or use `nvm install` to install the same version I used).

To run locally (against the real pokeapi), the easiest way is to use `make dev`:

```bash
make dev
```

This spins up a local database and runs the server on port 3000.

To remove the database, run `make dev-down`:

```bash
make dev-down
```

## Running tests

All tests are not in place to save on time, but those that are here can be run through `make test`:

```bash
make test
```

This spins up a database using docker compose and runs the tests all in one command.

To target a single test file, or passing any other argument to `jest` (such as `--watch`),
run add `TEST_OPTS="path/to/file --flags"`. For example:

```bash
# Target src/db/repository.test.ts and watch for changes.
make test TEST_OPTS="src/db/repository.test.ts --watch"
```

And then you can cleanup the database with `make test-down`:

```bash
make test-down
```

## Building the application

To build the application, run `make build`:

```bash
make build
```
