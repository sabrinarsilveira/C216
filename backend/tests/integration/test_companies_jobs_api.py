def test_rejeita_vaga_sem_empresa(client):
    response = client.post(
        "/api/jobs/", json={"company_id": 404, "title": "Backend Engineer"}
    )
    assert response.status_code == 404


def test_empresa_duplicada_retorna_conflito(client):
    body = {"name": "Northstar"}
    assert client.post("/api/companies/", json=body).status_code == 201
    assert client.post("/api/companies/", json=body).status_code == 409


def test_crud_empresa_e_vaga(client, create_job):
    company_id = create_job["company_id"]
    job_id = create_job["id"]

    assert client.get(f"/api/companies/{company_id}").status_code == 200
    updated_company = client.patch(
        f"/api/companies/{company_id}",
        json={"name": "Aurora Studio Updated", "website": "https://aurora.example"},
    )
    assert updated_company.status_code == 200
    assert updated_company.json()["name"] == "Aurora Studio Updated"

    assert client.get(f"/api/jobs/{job_id}").status_code == 200
    updated_job = client.patch(
        f"/api/jobs/{job_id}", json={"title": "Senior Product Designer"}
    )
    assert updated_job.status_code == 200
    assert updated_job.json()["title"] == "Senior Product Designer"

    assert client.delete(f"/api/jobs/{job_id}").status_code == 204
    assert client.get(f"/api/jobs/{job_id}").status_code == 404
    assert client.delete(f"/api/companies/{company_id}").status_code == 204
    assert client.get(f"/api/companies/{company_id}").status_code == 404


def test_nao_exclui_vaga_com_candidatura(client, create_job):
    application = client.post(
        "/api/applications/",
        json={"job_id": create_job["id"], "applied_on": "2026-11-20"},
    )
    assert application.status_code == 201

    response = client.delete(f"/api/jobs/{create_job['id']}")
    assert response.status_code == 409
    assert client.get(f"/api/jobs/{create_job['id']}").status_code == 200


def test_nao_exclui_empresa_com_candidatura_vinculada(client, create_job):
    application = client.post(
        "/api/applications/",
        json={"job_id": create_job["id"], "applied_on": "2026-11-20"},
    )
    assert application.status_code == 201

    response = client.delete(f"/api/companies/{create_job['company_id']}")
    assert response.status_code == 409
    assert client.get(f"/api/companies/{create_job['company_id']}").status_code == 200
