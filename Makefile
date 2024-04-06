DOCKER_COMPOSE := $(if $(shell PATH=$(PATH) command -v docker-compose), docker-compose, docker compose)

dev-mongodb-up:
	$(DOCKER_COMPOSE) up -d mongodb
dev-down:
	$(DOCKER_COMPOSE) down
dev: dev-mongodb-up
	DOTENV_PATH=env-dev npm run dev

test-mongodb-up:
	$(DOCKER_COMPOSE) -f docker-compose.test.yaml up -d mongodb
test-down:
	$(DOCKER_COMPOSE) -f docker-compose.test.yaml down
TEST_OPTS ?= ""
test: test-mongodb-up
	npm run test -- $(TEST_OPTS)
