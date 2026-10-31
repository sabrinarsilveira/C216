from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.task import Task, TaskCreate, TaskUpdate
from app.services import task as service

DbSession = Annotated[Session, Depends(get_db)]

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=list[Task])
def list_tasks(
    db: DbSession,
    completed: bool | None = None,
):
    return service.list_tasks(db, completed)


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int, db: DbSession):
    task = service.get_task(db, task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.post("/", response_model=Task, status_code=201)
def create_task(data: TaskCreate, db: DbSession):
    return service.create_task(db, data)


@router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    data: TaskCreate,
    db: DbSession,
):
    task = service.update_task(db, task_id, data)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.patch("/{task_id}", response_model=Task)
def patch_task(
    task_id: int,
    data: TaskUpdate,
    db: DbSession,
):
    task = service.patch_task(db, task_id, data)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: DbSession):
    deleted = service.delete_task(db, task_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
