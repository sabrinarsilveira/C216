def test_rejeita_transicao_invalida(client, create_job):
    application = client.post(
        "/api/applications/",
        json={"job_id": create_job["id"], "applied_on": "2026-11-20"},
    ).json()

    response = client.patch(
        f"/api/applications/{application['id']}", json={"status": "aprovado"}
    )

    assert response.status_code == 409
    persisted = client.get(f"/api/applications/{application['id']}").json()
    assert persisted["status"] == "inscrito"


def test_rejeita_entrevista_anterior_a_candidatura_na_criacao(client, create_job):
    response = client.post(
        "/api/applications/",
        json={
            "job_id": create_job["id"],
            "applied_on": "2026-11-20",
            "interview_at": "2026-11-19T10:00:00",
        },
    )

    assert response.status_code == 422


def test_rejeita_entrevista_anterior_a_candidatura_na_edicao(client, create_job):
    application = client.post(
        "/api/applications/",
        json={"job_id": create_job["id"], "applied_on": "2026-11-20"},
    ).json()

    response = client.patch(
        f"/api/applications/{application['id']}",
        json={"interview_at": "2026-11-19T10:00:00"},
    )

    assert response.status_code == 409


def test_persiste_historico_de_transicao_com_observacao(client, create_job):
    application = client.post(
        "/api/applications/",
        json={"job_id": create_job["id"], "applied_on": "2026-11-20"},
    ).json()

    updated = client.patch(
        f"/api/applications/{application['id']}",
        json={"status": "triagem", "notes": "Revisar portfolio"},
    )

    assert updated.status_code == 200
    history = updated.json()["history"]
    assert len(history) == 2
    assert history[0]["from_status"] is None
    assert history[0]["to_status"] == "inscrito"
    assert history[1]["from_status"] == "inscrito"
    assert history[1]["to_status"] == "triagem"
    assert history[1]["note"] == "Revisar portfolio"
