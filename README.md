# C216

Repositório para a matéria de Sistemas Distribuídos.

## Backend

O backend foi desenvolvido utilizando FastAPI e está organizado em diferentes camadas:

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   ├── schemas/
│   └── services/
└── tests/
    ├── unit/
    └── integration/
```

O `main.py` é responsável pela inicialização da aplicação, enquanto as rotas, schemas e regras de negócio são mantidos em módulos separados.

## API de tarefas

A API possui um CRUD simples de tarefas com os seguintes endpoints:

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/tasks/` | Lista as tarefas |
| GET | `/tasks/{task_id}` | Busca uma tarefa pelo ID |
| POST | `/tasks/` | Cria uma nova tarefa |
| PUT | `/tasks/{task_id}` | Atualiza uma tarefa |
| PATCH | `/tasks/{task_id}` | Atualiza parcialmente uma tarefa |
| DELETE | `/tasks/{task_id}` | Remove uma tarefa |

A listagem também permite filtrar tarefas utilizando o query parameter `completed`.

Exemplo:

```text
/tasks/?completed=true
```

## Testes

Os testes do backend são implementados utilizando Pytest e estão separados entre testes unitários e testes de integração.

### Executar os testes

Na raiz do projeto, execute:

```bash
make test
```

Também é possível executar diretamente pelo Poetry:

```bash
cd backend
poetry run pytest
```

## Docker

Para construir as imagens e iniciar os serviços:

```bash
make up-build
```

Para verificar o status dos containers:

```bash
make ps
```

Para encerrar os serviços:

```bash
make down
```

A documentação interativa da API pode ser acessada em:

```text
http://localhost:8000/docs
```

## Integração Contínua

Os testes são executados automaticamente pelo GitHub Actions através do workflow:

```text
.github/workflows/ci-backend.yml
```

O workflow é executado em eventos de `push` e `pull_request` e executa todos os testes unitários e de integração.