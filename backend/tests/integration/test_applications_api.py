def test_listar_candidaturas_e_dashboard_vazio(client):
    assert client.get("/api/applications/").json() == []
    assert client.get("/api/dashboard/").json()["total"] == 0


def test_empresa_vaga_e_candidatura_aparecem_no_pipeline(client, create_job):
    response = client.post(
        "/api/applications/",
        json={"job_id": create_job["id"], "applied_on": "2026-11-20"},
    )
    assert response.status_code == 201
    rows = client.get("/api/applications/").json()
    assert rows[0]["job"]["title"] == "Product Designer"
    assert rows[0]["job"]["company"]["name"] == "Aurora Studio"
