.PHONY: help install test lint format run clean clean-cache up up-build down build logs logs-api ps shell db-upgrade db-current frontend-install frontend-dev frontend-lint frontend-format frontend-check frontend-test frontend-test-e2e frontend-build e2e check-all
PYTEST := poetry run pytest
UVICORN := poetry run uvicorn
RUFF := poetry run ruff
ifeq ($(OS),Windows_NT)
E2E_RUN := powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/e2e.ps1
E2E_EXISTING := powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/e2e-existing.ps1
else
E2E_RUN := bash scripts/e2e.sh
E2E_EXISTING := bash scripts/e2e-existing.sh
endif
help:
	@echo "Comandos: make up-build, db-upgrade, test, frontend-test, frontend-check, frontend-build, e2e, check-all"
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
clean-cache:
	cd backend && rm -rf .pytest_cache .ruff_cache
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
logs-api:
	docker compose logs -f api
ps:
	docker compose ps
shell:
	docker compose exec api sh
db-upgrade:
	docker compose exec api alembic upgrade head
db-current:
	docker compose exec api alembic current
clean:
	cd backend && rm -rf .pytest_cache .ruff_cache
	docker compose down -v
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
	$(E2E_EXISTING)
frontend-build:
	npm --prefix frontend run build
e2e:
	$(E2E_RUN)
check-all: lint test frontend-check frontend-test frontend-build e2e
