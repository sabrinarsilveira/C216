import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models.career import (  # noqa: F401
    Application,
    ApplicationHistory,
    Company,
    Job,
)


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    testing_session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        with testing_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def create_job(client):
    company = client.post("/api/companies/", json={"name": "Aurora Studio"})
    assert company.status_code == 201
    job = client.post(
        "/api/jobs/",
        json={
            "company_id": company.json()["id"],
            "title": "Product Designer",
            "location": "Remoto",
        },
    )
    assert job.status_code == 201
    return job.json()
