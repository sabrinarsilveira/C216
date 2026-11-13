from unittest.mock import MagicMock, patch

from app.schemas.task import TaskCreate, TaskUpdate
from app.services import task as service


def test_create_task():
    db = MagicMock()
    data = TaskCreate(title="Nova tarefa", completed=False)
    expected = MagicMock(id=1, title="Nova tarefa", completed=False)

    with patch.object(service.repository, "create_task", return_value=expected) as mock:
        result = service.create_task(db, data)

    assert result is expected
    mock.assert_called_once_with(db, data)


def test_get_task():
    db = MagicMock()
    expected = MagicMock(id=1, title="Tarefa", completed=False)

    with patch.object(service.repository, "get_task", return_value=expected) as mock:
        result = service.get_task(db, 1)

    assert result is expected
    mock.assert_called_once_with(db, 1)


def test_list_tasks():
    db = MagicMock()
    expected = [
        MagicMock(id=1, title="Tarefa 1", completed=False),
        MagicMock(id=2, title="Tarefa 2", completed=True),
    ]

    with patch.object(service.repository, "list_tasks", return_value=expected) as mock:
        result = service.list_tasks(db)

    assert result is expected
    mock.assert_called_once_with(db, None)


def test_patch_task():
    db = MagicMock()
    data = TaskUpdate(completed=True)
    expected = MagicMock(id=1, title="Tarefa", completed=True)

    with patch.object(service.repository, "patch_task", return_value=expected) as mock:
        result = service.patch_task(db, 1, data)

    assert result is expected
    mock.assert_called_once_with(db, 1, data)


def test_delete_task():
    db = MagicMock()

    with patch.object(service.repository, "delete_task", return_value=True) as mock:
        result = service.delete_task(db, 1)

    assert result is True
    mock.assert_called_once_with(db, 1)
