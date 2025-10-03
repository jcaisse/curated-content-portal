SHA := $(shell git rev-parse --short HEAD)

.PHONY: build-image run-migrate run-app

build-image:
	node scripts/generate-build-info.js
	docker build --build-arg GIT_COMMIT_SHA=$(SHA) -t cleanportal-app:$(SHA) .

run-migrate:
	APP_IMAGE=cleanportal-app:$(SHA) docker compose up migrate

run-app:
	APP_IMAGE=cleanportal-app:$(SHA) docker compose up -d app scheduler

.PHONY: help dev build start test e2e compose-dev compose-prod clean

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development server
	npm run dev

build: ## Build the application
	npm run build

start: ## Start production server
	npm run start

# Database commands
db-migrate: ## Run database migrations
	npm run db:migrate

db-push: ## Push database schema changes
	npm run db:push

db-generate: ## Generate Prisma client
	npm run db:generate

db-seed: ## Seed the database
	npm run seed

db-studio: ## Open Prisma Studio
	npm run db:studio

# Testing commands
test: ## Run unit tests
	npm run test

test-watch: ## Run unit tests in watch mode
	npm run test:watch

e2e: ## Run end-to-end tests
	npm run test:e2e

e2e-ui: ## Run end-to-end tests with UI
	npm run test:e2e:ui

# Docker commands
compose-dev: ## Start development environment with Docker Compose
	docker compose --profile dev up --build

compose-prod: ## Start production environment with Docker Compose
	docker compose --profile prod up --build

compose-test: ## Run tests with Docker Compose
	docker compose --profile test up --build

docker-build: ## Build Docker image
	npm run docker:build

docker-test: ## Build test Docker image
	npm run docker:test

# Utility commands
install: ## Install dependencies
	npm install

lint: ## Run linter
	npm run lint

type-check: ## Run TypeScript type checking
	npm run type-check

clean: ## Clean up generated files
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf dist

# Crawling commands
crawl: ## Run content crawling (usage: make crawl KEYWORD="artificial intelligence" LIMIT=10)
	npm run crawl -- --keyword="$(KEYWORD)" --limit=$(LIMIT)

curate: ## Run AI curation
	npm run curate

# Setup commands
setup: ## Initial setup (install deps, generate Prisma client, run migrations)
	npm install
	npm run db:generate
	npm run db:push
	npm run seed

# Production deployment
deploy: ## Deploy to production (usage: make deploy HOST=example.com USER=deploy APP=my-app)
	./scripts/deploy.sh $(HOST) $(USER) $(APP) $(IMAGE) $(ENV_FILE)
