import pytest

from app.schemas.task import TaskCreate, TaskUpdate
from app.services import task as service


@pytest.fixture(autouse=True)
def reset_tasks():
    service.tasks.clear()
    service.next_id = 1


def test_create_task():
    data = TaskCreate(title="Estudar FastAPI")

    task = service.create_task(data)

    assert task.id == 1
    assert task.title == "Estudar FastAPI"
    assert task.completed is False


def test_get_task():
    created = service.create_task(TaskCreate(title="Fazer atividade"))

    task = service.get_task(created.id)

    assert task == created


def test_list_tasks():
    service.create_task(TaskCreate(title="Tarefa 1"))
    service.create_task(TaskCreate(title="Tarefa 2"))

    tasks = service.list_tasks()

    assert len(tasks) == 2


def test_patch_task():
    created = service.create_task(TaskCreate(title="Título antigo"))

    updated = service.patch_task(
        created.id,
        TaskUpdate(title="Título novo"),
    )

    assert updated.title == "Título novo"


def test_delete_task():
    created = service.create_task(TaskCreate(title="Excluir"))

    deleted = service.delete_task(created.id)

    assert deleted.id == created.id
    assert service.get_task(created.id) is None