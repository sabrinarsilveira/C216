import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import task as service


client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_tasks():
    service.tasks.clear()
    service.next_id = 1


def test_create_task():
    response = client.post(
        "/tasks/",
        json={"title": "Estudar FastAPI", "completed": False},
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Estudar FastAPI"


def test_list_tasks():
    client.post("/tasks/", json={"title": "Tarefa 1"})
    client.post("/tasks/", json={"title": "Tarefa 2"})

    response = client.get("/tasks/")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_task():
    created = client.post(
        "/tasks/",
        json={"title": "Fazer atividade"},
    ).json()

    response = client.get(f"/tasks/{created['id']}")

    assert response.status_code == 200
    assert response.json()["title"] == "Fazer atividade"


def test_update_task():
    created = client.post(
        "/tasks/",
        json={"title": "Título antigo"},
    ).json()

    response = client.put(
        f"/tasks/{created['id']}",
        json={"title": "Título novo", "completed": True},
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Título novo"
    assert response.json()["completed"] is True


def test_patch_task():
    created = client.post(
        "/tasks/",
        json={"title": "Tarefa"},
    ).json()

    response = client.patch(
        f"/tasks/{created['id']}",
        json={"completed": True},
    )

    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_delete_task():
    created = client.post(
        "/tasks/",
        json={"title": "Excluir"},
    ).json()

    response = client.delete(f"/tasks/{created['id']}")

    assert response.status_code == 204


def test_filter_tasks_by_completed():
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
    assert response.json()[0]["completed"] is True


def test_task_not_found():
    response = client.get("/tasks/999")

    assert response.status_code == 404