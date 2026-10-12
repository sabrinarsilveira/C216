from app.schemas.task import Task, TaskCreate, TaskUpdate


tasks: dict[int, Task] = {}
next_id = 1


def list_tasks(completed: bool | None = None):
    if completed is None:
        return list(tasks.values())

    return [
        task for task in tasks.values()
        if task.completed == completed
    ]


def get_task(task_id: int):
    return tasks.get(task_id)


def create_task(data: TaskCreate):
    global next_id

    task = Task(
        id=next_id,
        title=data.title,
        completed=data.completed,
    )

    tasks[next_id] = task
    next_id += 1

    return task


def update_task(task_id: int, data: TaskCreate):
    if task_id not in tasks:
        return None

    task = Task(
        id=task_id,
        title=data.title,
        completed=data.completed,
    )

    tasks[task_id] = task
    return task


def patch_task(task_id: int, data: TaskUpdate):
    task = tasks.get(task_id)

    if task is None:
        return None

    update_data = data.model_dump(exclude_unset=True)

    updated_task = task.model_copy(update=update_data)

    tasks[task_id] = updated_task

    return updated_task


def delete_task(task_id: int):
    return tasks.pop(task_id, None)