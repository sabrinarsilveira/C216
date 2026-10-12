from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def list_tasks(db: Session, completed: bool | None = None):
    stmt = select(Task)

    if completed is not None:
        stmt = stmt.where(Task.completed == completed)

    return db.scalars(stmt).all()


def get_task(db: Session, task_id: int):
    return db.get(Task, task_id)


def create_task(db: Session, data: TaskCreate):
    task = Task(**data.model_dump())

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


def update_task(db: Session, task_id: int, data: TaskCreate):
    task = get_task(db, task_id)

    if task is None:
        return None

    task.title = data.title
    task.completed = data.completed

    db.commit()
    db.refresh(task)

    return task


def patch_task(db: Session, task_id: int, data: TaskUpdate):
    task = get_task(db, task_id)

    if task is None:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


def delete_task(db: Session, task_id: int):
    task = get_task(db, task_id)

    if task is None:
        return False

    db.delete(task)
    db.commit()

    return True
