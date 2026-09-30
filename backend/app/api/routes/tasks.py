from fastapi import APIRouter, HTTPException

from app.schemas.task import Task, TaskCreate, TaskUpdate
from app.services import task as service


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=list[Task])
def list_tasks(completed: bool | None = None):
    return service.list_tasks(completed)


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int):
    task = service.get_task(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.post("/", response_model=Task, status_code=201)
def create_task(data: TaskCreate):
    return service.create_task(data)


@router.put("/{task_id}", response_model=Task)
def update_task(task_id: int, data: TaskCreate):
    task = service.update_task(task_id, data)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.patch("/{task_id}", response_model=Task)
def patch_task(task_id: int, data: TaskUpdate):
    task = service.patch_task(task_id, data)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int):
    task = service.delete_task(task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")