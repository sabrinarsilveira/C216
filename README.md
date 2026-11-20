# Trilha — gestão de vagas e candidaturas

Aplicação full-stack para organizar a busca por oportunidades de trabalho. A Trilha reúne empresas e vagas, acompanha cada candidatura em um quadro Kanban e registra a evolução do processo seletivo.

## Funcionalidades

- Cadastro de empresas e vagas com localidade, modalidade, faixa salarial, link e descrição.
- Cadastro, consulta, edição e exclusão de candidaturas vinculadas a uma vaga.
- Pipeline Kanban com as etapas inscrito, triagem, entrevista, teste técnico, aprovado e reprovado.
- Regras que validam transições entre etapas e impedem entrevistas anteriores à data da candidatura.
- Histórico de alterações de etapa com data, etapa anterior, nova etapa e observação.
- Dashboard com candidaturas totais, em andamento, aprovadas e paradas há mais de sete dias.
- Busca por empresa ou cargo, agendamento de entrevista e observações por candidatura.

## CRUD, regras e API

Empresas e vagas podem ser cadastradas, listadas, consultadas, editadas e excluídas. Uma empresa ou vaga vinculada a candidaturas não pode ser excluída; a API responde com conflito (HTTP 409). As candidaturas também oferecem operações de cadastro, consulta, edição e exclusão.

Os endpoints ficam sob o prefixo `/api`:

| Recurso | Endpoints |
| --- | --- |
| Empresas | `GET/POST /companies/`, `GET/PATCH/DELETE /companies/{id}` |
| Vagas | `GET/POST /jobs/`, `GET/PATCH/DELETE /jobs/{id}` |
| Candidaturas | `GET/POST /applications/`, `GET/PATCH/DELETE /applications/{id}` |
| Dashboard | `GET /dashboard/` |

A API rejeita transições de status inválidas, registra no histórico cada mudança de etapa e sua observação, e impede que a data da entrevista seja anterior à candidatura. A exclusão de vaga ou empresa com candidaturas associadas é bloqueada para preservar os vínculos.

Os testes E2E também cobrem edição e exclusão de empresas e vagas, além do fluxo de candidatura e da persistência após recarregar a página.

## Tecnologias e arquitetura

- **Frontend:** React 19, JavaScript, Vite, Tailwind CSS e Biome.
- **API:** Python 3.12, FastAPI, Pydantic, arquitetura separada em rotas, serviços, repositórios, schemas e models.
- **Persistência:** PostgreSQL 16, SQLAlchemy e Alembic.
- **Infraestrutura:** Docker Compose com serviços de banco, API e interface.
- **Qualidade:** Pytest, Vitest, Testing Library, Playwright e GitHub Actions.

A interface consome a API REST em `/api`. As rotas tratam HTTP, os serviços aplicam regras de negócio e os repositórios encapsulam consultas e operações SQLAlchemy. Registros e histórico ficam em tabelas relacionais. As migrações são executadas quando o contêiner da API inicia.

## Estrutura

```text
backend/
  app/
    api/routes/       # endpoints REST
    repositories/     # consultas e persistência SQLAlchemy
    models/           # empresa, vaga, candidatura e histórico
    schemas/          # validação e contratos da API
    services/         # regras de negócio e consultas
  alembic/versions/   # migrações versionadas
  tests/              # testes de API e regras
frontend/
  src/App.jsx         # painel, Kanban, formulários e navegação
  src/services/       # cliente HTTP da API
  tests/              # Vitest e Playwright
docker-compose.yml
Makefile
```

## Pré-requisitos

- Docker Desktop com Docker Compose.
- Node.js 22 e npm para executar as ferramentas do frontend fora do Docker.
- Python 3.11 ou superior e Poetry para executar as ferramentas do backend fora do Docker.
- GNU Make (ou comandos equivalentes abaixo).

## Configuração e execução

Copie o arquivo de exemplo e ajuste as portas se necessário:

```sh
cp .env.example .env
docker compose up --build
```

Acesse a aplicação em [http://localhost:5173](http://localhost:5173). A documentação interativa da API fica em [http://localhost:8000/docs](http://localhost:8000/docs).

No Windows PowerShell, copie a configuração com:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Para acompanhar os serviços ou encerrá-los:

```sh
docker compose ps
docker compose logs -f
docker compose down
```

Os dados ficam no volume `postgres_data` e continuam disponíveis após reiniciar os contêineres. Para apagar também os dados persistidos, use `docker compose down -v`.

## Variáveis de ambiente

| Variável | Uso | Padrão |
| --- | --- | --- |
| `DB_PORT` | Porta local do PostgreSQL | `5432` |
| `API_PORT` | Porta local da API | `8000` |
| `FRONTEND_PORT` | Porta local da interface | `5173` |
| `POSTGRES_USER` | Usuário local do banco | `postgres` |
| `POSTGRES_PASSWORD` | Senha local do banco | `postgres` |
| `POSTGRES_DB` | Nome do banco | `trilha` |
| `VITE_API_URL` | Endereço da API visto pelo navegador | `http://localhost:8000` |
| `CORS_ORIGINS` | Origens liberadas pela API, separadas por vírgula | localhost:5173 |

Os valores do `.env.example` são somente para desenvolvimento local. Não use credenciais reais no repositório.

## Migrações e comandos

O contêiner da API aplica `alembic upgrade head` antes de iniciar o servidor. Para consultar ou reaplicar a migração manualmente:

```sh
docker compose exec api alembic current
docker compose exec api alembic upgrade head
```

O Makefile reúne os comandos recorrentes:

```sh
make up-build       # compila e inicia banco, API e frontend
make down           # encerra os serviços
make test           # testes Pytest
make lint           # Ruff
make frontend-test  # Vitest
make frontend-check # Biome e formatação
make frontend-build # build de produção do frontend
make e2e            # Playwright com PostgreSQL e Docker Compose isolados
make check-all      # verificações, testes, build e E2E
```

## Testes

Os testes de backend usam SQLite em memória para exercitar endpoints, persistência relacional, histórico, dashboard e regras de transição sem depender de um serviço externo:

```sh
cd backend
poetry install
poetry run pytest
poetry run ruff check .
```

Os testes e build do frontend:

```sh
cd frontend
npm ci
npm run lint
npm run format:check
npm run test
npm run build
```

O fluxo E2E sobe PostgreSQL, API e frontend em uma composição isolada, registra uma empresa, uma vaga e uma candidatura, confirma a persistência após recarregar, avança a etapa e exclui a candidatura:

```sh
make e2e
```

O GitHub Actions executa verificações do backend e do frontend em Pull Requests. O workflow de frontend também instala Chromium e roda o fluxo E2E.

## Vídeo demonstrativo

[Assistir ao video demonstrativo](https://www.youtube.com/watch?v=3r6r6NTqwGs)

