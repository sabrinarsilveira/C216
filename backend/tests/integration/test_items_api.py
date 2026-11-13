import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models.item import Item  # noqa: F401


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        with factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db, None)
        engine.dispose()


def test_items_cors_allows_frontend_origin():
    with TestClient(app) as client:
        response = client.options(
            "/items/",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_items_cors_rejects_unknown_origin():
    with TestClient(app) as client:
        response = client.options(
            "/items/",
            headers={
                "Origin": "http://malicious.example",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
    assert "access-control-allow-origin" not in response.headers


def test_item_create_list_and_duplicate(client):
    first = client.post("/items/", json={"name": "Livro", "description": "Ficção"})
    assert first.status_code == 201
    assert first.json()["description"] == "Ficção"
    assert client.get("/items/").json() == [first.json()]
    duplicate = client.post("/items/", json={"name": "Livro"})
    assert duplicate.status_code == 409
