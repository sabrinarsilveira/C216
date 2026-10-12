import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models.task import Task  # noqa: F401


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
    )

    def override_get_db():
        with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db, None)
        engine.dispose()


def test_create_task(client):
    response = client.post(
        "/tasks/",
        json={"title": "Nova tarefa", "completed": False},
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Nova tarefa"
    assert response.json()["completed"] is False
    assert isinstance(response.json()["id"], int)


def test_list_tasks(client):
    client.post("/tasks/", json={"title": "Tarefa 1"})
    client.post("/tasks/", json={"title": "Tarefa 2"})

    response = client.get("/tasks/")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_task(client):
    created = client.post(
        "/tasks/",
        json={"title": "Buscar tarefa"},
    ).json()

    response = client.get(f"/tasks/{created['id']}")

    assert response.status_code == 200
    assert response.json()["title"] == "Buscar tarefa"


def test_update_task(client):
    created = client.post(
        "/tasks/",
        json={"title": "Tarefa original"},
    ).json()

    response = client.put(
        f"/tasks/{created['id']}",
        json={"title": "Tarefa atualizada", "completed": True},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Tarefa atualizada"
    assert response.json()["completed"] is True


def test_patch_task(client):
    created = client.post(
        "/tasks/",
        json={"title": "Tarefa original"},
    ).json()

    response = client.patch(
        f"/tasks/{created['id']}",
        json={"completed": True},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Tarefa original"
    assert response.json()["completed"] is True


def test_delete_task(client):
    created = client.post(
        "/tasks/",
        json={"title": "Tarefa para excluir"},
    ).json()

    response = client.delete(f"/tasks/{created['id']}")

    assert response.status_code == 204

    get_response = client.get(f"/tasks/{created['id']}")
    assert get_response.status_code == 404


def test_filter_tasks_by_completed(client):
    client.post(
        "/tasks/",
        json={"title": "Concluída", "completed": True},
    )
    client.post(
        "/tasks/",
        json={"title": "Pendente", "completed": False},
    )

    response = client.get("/tasks/?completed=true")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Concluída"


def test_task_not_found(client):
    response = client.get("/tasks/999")

    assert response.status_code == 404
