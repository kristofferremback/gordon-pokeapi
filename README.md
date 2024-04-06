# gordon-pokeapi

## Running locally

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
