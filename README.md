# C216

Repositório para a matéria de Sistemas Distribuídos.

## Backend

O backend foi desenvolvido utilizando **FastAPI**, com persistência de dados em **PostgreSQL** por meio do **SQLAlchemy**.

A aplicação está organizada em camadas para separar as responsabilidades de cada componente.

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   └── database/
├── alembic/
│   └── versions/
├── tests/
│   ├── unit/
│   └── integration/
├── alembic.ini
├── Dockerfile
└── pyproject.toml
```

As principais responsabilidades são:

- **API:** define os endpoints e recebe as requisições HTTP.
- **Schemas:** valida os dados de entrada e saída utilizando Pydantic.
- **Services:** organiza as operações da aplicação.
- **Repositories:** realiza as operações de consulta e persistência no banco.
- **Models:** define as tabelas utilizando SQLAlchemy ORM.
- **Database:** configura a conexão e as sessões com o PostgreSQL.
- **Alembic:** gerencia as migrations do banco de dados.

## API de tarefas

A API disponibiliza um CRUD de tarefas com os seguintes endpoints:

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/tasks/` | Lista as tarefas |
| GET | `/tasks/{task_id}` | Busca uma tarefa pelo ID |
| POST | `/tasks/` | Cria uma nova tarefa |
| PUT | `/tasks/{task_id}` | Atualiza uma tarefa |
| PATCH | `/tasks/{task_id}` | Atualiza parcialmente uma tarefa |
| DELETE | `/tasks/{task_id}` | Remove uma tarefa |

A listagem também permite filtrar tarefas pelo parâmetro `completed`.

Exemplo:

```text
/tasks/?completed=true
```

## Banco de dados

O projeto utiliza **PostgreSQL 16** executado em um container Docker.

A conexão com o banco é realizada utilizando SQLAlchemy e o driver Psycopg.

A URL de conexão pode ser configurada pela variável de ambiente `DATABASE_URL`.

Dentro do Docker, o hostname do PostgreSQL é `db`:

```text
postgresql+psycopg://postgres:postgres@db:5432/c216
```

Para executar comandos do Poetry diretamente no computador, a conexão local utiliza `localhost`:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/c216
```

As credenciais apresentadas são destinadas exclusivamente ao ambiente local de desenvolvimento.

### Estrutura da tabela tasks

| Campo | Tipo | Descrição |
|---|---|---|
| id | Integer | Identificador da tarefa e chave primária |
| title | String(255) | Título da tarefa |
| completed | Boolean | Indica se a tarefa foi concluída |

## Docker

Na raiz do projeto, execute:

```bash
make up-build
```

Esse comando constrói a imagem do backend e inicia os containers da API e do PostgreSQL.

Para verificar os containers:

```bash
make ps
```

Para acompanhar os logs:

```bash
make logs
```

Para encerrar os serviços:

```bash
make down
```

O volume do PostgreSQL mantém os dados armazenados entre reinicializações dos containers.

A documentação interativa da API está disponível em:

http://localhost:8000/docs

## Migrations com Alembic

O projeto utiliza **Alembic** para controlar as alterações na estrutura do banco de dados.

As migrations estão armazenadas em:

```text
backend/alembic/versions/
```

### Executar as migrations

Primeiro, inicie o PostgreSQL:

```bash
make up
```

Depois, acesse a pasta do backend:

```bash
cd backend
```

Execute:

```bash
poetry run alembic upgrade head
```

Esse comando aplica as migrations pendentes, criando a tabela `tasks` quando necessário.

### Verificar a migration atual

```bash
poetry run alembic current
```

### Criar uma nova migration

Após modificar os modelos SQLAlchemy, é possível gerar uma migration com:

```bash
poetry run alembic revision --autogenerate -m "descricao da alteracao"
```

A migration gerada deve ser revisada antes da aplicação.

### Reverter a última migration

```bash
poetry run alembic downgrade -1
```

**Atenção:** o downgrade pode remover estruturas e dados. Utilize somente quando necessário e após avaliar os efeitos da migration.

## Testes

Os testes são implementados utilizando **Pytest** e divididos em:

- **Testes unitários:** verificam o comportamento do Service utilizando mocks.
- **Testes de integração:** verificam os endpoints FastAPI com `TestClient` e um banco SQLite temporário.

Os testes de integração não modificam os dados do PostgreSQL de desenvolvimento.

### Executar todos os testes

Na raiz do projeto:

```bash
make test
```

Também é possível executar diretamente pelo Poetry:

```bash
cd backend
poetry run pytest
```

### Executar somente os testes unitários

```bash
cd backend
poetry run pytest tests/unit/ -v
```

### Executar somente os testes de integração

```bash
cd backend
poetry run pytest tests/integration/ -v
```

## Qualidade de código

O projeto utiliza **Ruff** para formatação e análise estática.

Na raiz do projeto, execute:

```bash
make format
```

Para verificar possíveis problemas:

```bash
make lint
```

## Integração Contínua

O projeto possui um workflow do GitHub Actions:

```text
.github/workflows/ci-backend.yml
```

O workflow é acionado em eventos de `push` e `pull_request` e executa os testes automatizados do backend.

## Validação da Prática 5

Foram realizadas as seguintes verificações locais:

- Inicialização do FastAPI e PostgreSQL com Docker Compose.
- Criação e consulta de tarefas no PostgreSQL.
- Persistência dos dados após reiniciar o backend.
- Aplicação da migration em um banco PostgreSQL vazio.
- Execução de 13 testes automatizados com sucesso.
- Formatação e análise estática com Ruff sem erros.

A execução do workflow no GitHub Actions deve ser confirmada após o envio da branch ao repositório remoto.
