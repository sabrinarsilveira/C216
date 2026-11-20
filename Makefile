.PHONY: help install test lint format run up up-build down build logs ps db-upgrade frontend-install frontend-dev frontend-lint frontend-check frontend-format frontend-test frontend-test-e2e frontend-build e2e check-all
PYTEST := poetry run pytest
UVICORN := poetry run uvicorn
RUFF := poetry run ruff
ifeq ($(OS),Windows_NT)
E2E_RUN := powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/e2e.ps1
else
E2E_RUN := bash scripts/e2e.sh
endif

help:
	@echo "Comandos: make up-build, down, test, frontend-test, frontend-check, frontend-build, e2e"
install:
	cd backend && poetry install
test:
	cd backend && $(PYTEST)
lint:
	cd backend && $(RUFF) check .
format:
	cd backend && $(RUFF) format .
run:
	cd backend && $(UVICORN) app.main:app --reload
up:
	docker compose up -d
up-build:
	docker compose up -d --build
down:
	docker compose down
build:
	docker compose build
logs:
	docker compose logs -f
ps:
	docker compose ps
db-upgrade:
	docker compose exec api alembic upgrade head
frontend-install:
	npm --prefix frontend ci
frontend-dev:
	npm --prefix frontend run dev
frontend-lint:
	npm --prefix frontend run lint
frontend-format:
	npm --prefix frontend run format
frontend-check:
	npm --prefix frontend run lint && npm --prefix frontend run format:check
frontend-test:
	npm --prefix frontend run test
frontend-test-e2e:
	npm --prefix frontend run test:e2e
frontend-build:
	npm --prefix frontend run build
e2e:
	$(E2E_RUN)
check-all: lint test frontend-check frontend-test frontend-build e2e

