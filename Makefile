DOCKER_COMPOSE := $(if $(shell PATH=$(PATH) command -v docker-compose), docker-compose, docker compose)

mongodb-up:
	$(DOCKER_COMPOSE) up -d mongodb

dev: mongodb-up
	DOTENV_PATH=env-dev npm run dev
