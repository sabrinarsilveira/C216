def test_rejeita_vaga_sem_empresa(client):
    response = client.post(
        "/api/jobs/", json={"company_id": 404, "title": "Backend Engineer"}
    )
    assert response.status_code == 404


def test_empresa_duplicada_retorna_conflito(client):
    body = {"name": "Northstar"}
    assert client.post("/api/companies/", json=body).status_code == 201
    assert client.post("/api/companies/", json=body).status_code == 409
