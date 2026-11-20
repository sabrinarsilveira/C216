from datetime import UTC, datetime, timedelta

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.career import Application, ApplicationHistory, Company, Job
from app.repositories import career as repository
from app.schemas.career import (
    ApplicationCreate,
    ApplicationStatus,
    ApplicationUpdate,
    CompanyCreate,
    JobCreate,
)

ALLOWED_TRANSITIONS = {
    "inscrito": {"triagem", "reprovado"},
    "triagem": {"entrevista", "teste_tecnico", "aprovado", "reprovado"},
    "entrevista": {"teste_tecnico", "aprovado", "reprovado"},
    "teste_tecnico": {"aprovado", "reprovado"},
    "aprovado": set(),
    "reprovado": set(),
}


class ResourceNotFoundError(Exception):
    pass


class ResourceConflictError(Exception):
    pass


def now() -> datetime:
    return datetime.now(UTC)


def list_companies(db: Session):
    return repository.list_companies(db)


def get_company(db: Session, company_id: int):
    return repository.get_company(db, company_id)


def create_company(db: Session, data: CompanyCreate):
    company = Company(**data.model_dump())
    try:
        repository.add_company(db, company)
        db.commit()
        db.refresh(company)
    except IntegrityError as error:
        db.rollback()
        raise ResourceConflictError("Esta empresa já está cadastrada.") from error
    return company


def update_company(db: Session, company: Company, data):
    try:
        repository.update_company(db, company, data.model_dump(exclude_unset=True))
        db.commit()
        db.refresh(company)
    except IntegrityError as error:
        db.rollback()
        raise ResourceConflictError("Já existe uma empresa com esse nome.") from error
    return company


def delete_company(db: Session, company: Company):
    try:
        repository.delete_company(db, company)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ResourceConflictError(
            "Não é possível excluir uma empresa com candidaturas vinculadas."
        ) from error


def list_jobs(db: Session):
    return repository.list_jobs(db)


def get_job(db: Session, job_id: int):
    return repository.get_job(db, job_id)


def create_job(db: Session, data: JobCreate):
    if not repository.get_company(db, data.company_id):
        raise ResourceNotFoundError("Empresa não encontrada.")
    job = Job(**data.model_dump(), created_at=now())
    repository.add_job(db, job)
    db.commit()
    return repository.get_job(db, job.id)


def update_job(db: Session, job: Job, data):
    values = data.model_dump(exclude_unset=True)
    company_id = values.get("company_id")
    if company_id is not None and not repository.get_company(db, company_id):
        raise ResourceNotFoundError("Empresa não encontrada.")
    try:
        repository.update_job(db, job, values)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ResourceConflictError("Não foi possível atualizar a vaga.") from error
    return repository.get_job(db, job.id)


def delete_job(db: Session, job: Job):
    try:
        repository.delete_job(db, job)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise ResourceConflictError(
            "Não é possível excluir uma vaga com candidaturas."
        ) from error


def list_applications(db: Session):
    return repository.list_applications(db)


def get_application(db: Session, application_id: int):
    return repository.get_application(db, application_id)


def create_application(db: Session, data: ApplicationCreate):
    if not repository.get_job(db, data.job_id):
        raise ResourceNotFoundError("Vaga não encontrada.")
    timestamp = now()
    application = Application(
        **data.model_dump(),
        status=ApplicationStatus.INSCRITO.value,
        last_updated=timestamp,
    )
    application.history.append(
        ApplicationHistory(
            from_status=None,
            to_status="inscrito",
            note="Candidatura criada",
            changed_at=timestamp,
        )
    )
    repository.add_application(db, application)
    db.commit()
    return repository.get_application(db, application.id)


def update_application(db: Session, application: Application, data: ApplicationUpdate):
    values = data.model_dump(exclude_unset=True)
    interview_at = values.get("interview_at")
    if interview_at and interview_at.date() < application.applied_on:
        raise ValueError("A entrevista não pode ser anterior à data da candidatura.")

    new_status = values.pop("status", None)
    if new_status and new_status.value != application.status:
        if new_status.value not in ALLOWED_TRANSITIONS[application.status]:
            raise ValueError(
                f"Transição inválida: {application.status} → {new_status.value}."
            )
        application.history.append(
            ApplicationHistory(
                from_status=application.status,
                to_status=new_status.value,
                note=values.get("notes"),
                changed_at=now(),
            )
        )
        application.status = new_status.value

    for key, value in values.items():
        setattr(application, key, value)
    application.last_updated = now()
    repository.save_application(db, application)
    db.commit()
    return repository.get_application(db, application.id)


def delete_application(db: Session, application: Application):
    repository.delete_application(db, application)
    db.commit()


def dashboard(db: Session):
    counts = repository.count_applications_by_status(db)
    total = sum(counts.values())
    stale = repository.count_stale_applications(db, now() - timedelta(days=7))
    return {
        "total": total,
        "aprovados": counts.get("aprovado", 0),
        "reprovados": counts.get("reprovado", 0),
        "em_andamento": total - counts.get("aprovado", 0) - counts.get("reprovado", 0),
        "sem_atualizacao": stale,
        "por_status": counts,
    }
