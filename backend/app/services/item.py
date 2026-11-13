from sqlalchemy.orm import Session

from app.repositories import item as repository
from app.schemas.item import ItemCreate


def list_items(db: Session):
    return repository.list_items(db)


def create_item(db: Session, data: ItemCreate):
    return repository.create_item(db, data)
