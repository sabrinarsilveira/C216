.PHONY: help install test lint format run clean clean-cache \
        up up-build down build logs logs-api ps shell \
        frontend-install frontend-dev frontend-lint frontend-format \
        frontend-check frontend-test frontend-test-e2e frontend-build check-all

PYTEST := poetry run pytest
UVICORN := poetry run uvicorn
RUFF := poetry run ruff

help:
	@echo "Comandos disponíveis:"
	@echo "  make install     - instala dependências"
	@echo "  make test        - executa testes"
	@echo "  make lint        - verifica o código"
	@echo "  make format      - formata o código"
	@echo "  make run         - inicia o servidor"
	@echo "  make clean-cache - remove arquivos temporários"
	@echo "  make up          - sobe os containers"
	@echo "  make up-build    - reconstrói as imagens e sobe os containers"
	@echo "  make down        - para e remove os containers"
	@echo "  make build       - constrói as imagens"
	@echo "  make logs        - acompanha os logs"
	@echo "  make logs-api    - acompanha apenas os logs da API"
	@echo "  make ps          - mostra o status dos serviços"
	@echo "  make shell       - abre um shell no container da API"
	@echo "  make clean       - remove caches, containers, rede e volumes"

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
	docker compose logs -f backend

ps:
	docker compose ps

shell:
	docker compose exec backend sh

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
	npm --prefix frontend run test:e2e

frontend-build:
	npm --prefix frontend run build

check-all: lint test frontend-check frontend-test frontend-build frontend-test-e2e
