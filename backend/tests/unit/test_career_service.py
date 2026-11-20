from app.services.career import ALLOWED_TRANSITIONS


def test_etapas_permitem_avanco_e_resultados_finais():
    assert "triagem" in ALLOWED_TRANSITIONS["inscrito"]
    assert "entrevista" in ALLOWED_TRANSITIONS["triagem"]
    assert ALLOWED_TRANSITIONS["aprovado"] == set()
    assert ALLOWED_TRANSITIONS["reprovado"] == set()
    assert "aprovado" not in ALLOWED_TRANSITIONS["inscrito"]
