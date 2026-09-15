.PHONY: help install test lint format run clean clean-cache \
        up up-build down build logs logs-api ps shell

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