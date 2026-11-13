from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.item import ItemCreate, ItemRead
from app.services import item as service

DbSession = Annotated[Session, Depends(get_db)]
router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=list[ItemRead])
def list_items(db: DbSession):
    return service.list_items(db)


@router.post("/", response_model=ItemRead, status_code=201)
def create_item(data: ItemCreate, db: DbSession):
    item = service.create_item(db, data)
    if item is None:
        raise HTTPException(status_code=409, detail="Já existe um item com esse nome")
    return item
