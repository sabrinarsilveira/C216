from sqlalchemy.orm import Session

from app.repositories import task as repository
from app.schemas.task import TaskCreate, TaskUpdate


def list_tasks(db: Session, completed: bool | None = None):
    return repository.list_tasks(db, completed)


def get_task(db: Session, task_id: int):
    return repository.get_task(db, task_id)


def create_task(db: Session, data: TaskCreate):
    return repository.create_task(db, data)


def update_task(db: Session, task_id: int, data: TaskCreate):
    return repository.update_task(db, task_id, data)


def patch_task(db: Session, task_id: int, data: TaskUpdate):
    return repository.patch_task(db, task_id, data)


def delete_task(db: Session, task_id: int):
    return repository.delete_task(db, task_id)
