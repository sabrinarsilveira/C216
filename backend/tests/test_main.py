import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_home_status_code(client):
    response = client.get("/")
    assert response.status_code == 200


def test_home_message(client):
    response = client.get("/")
    assert response.json() == {"message": "Backend funcionando"}


def test_rota_inexistente(client):
    response = client.get("/rota-inexistente")
    assert response.status_code == 404


@pytest.mark.parametrize(
    "rota,status_esperado",
    [
        ("/", 200),
        ("/rota-inexistente", 404),
        ("/qualquer-coisa", 404),
    ],
)
def test_status_das_rotas(client, rota, status_esperado):
    response = client.get(rota)
    assert response.status_code == status_esperado


def test_home_content_type(client):
    response = client.get("/")
    assert "application/json" in response.headers["content-type"]