from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.item import Item
from app.schemas.item import ItemCreate


def list_items(db: Session):
    return db.scalars(select(Item).order_by(Item.id)).all()


def create_item(db: Session, data: ItemCreate):
    item = Item(name=data.name, description=data.description)
    db.add(item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(item)
    return item
