from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.career import Application, ApplicationHistory, Company, Job
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


def now() -> datetime:
    return datetime.now(UTC)


def list_companies(db: Session):
    return db.scalars(select(Company).order_by(Company.name)).all()


def create_company(db: Session, data: CompanyCreate):
    company = Company(**data.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def list_jobs(db: Session):
    statement = (
        select(Job).options(joinedload(Job.company)).order_by(Job.created_at.desc())
    )
    return db.scalars(statement).unique().all()


def create_job(db: Session, data: JobCreate):
    job = Job(**data.model_dump(), created_at=now())
    db.add(job)
    db.commit()
    db.refresh(job)
    return db.scalar(
        select(Job).options(joinedload(Job.company)).where(Job.id == job.id)
    )


def list_applications(db: Session):
    statement = (
        select(Application)
        .options(
            joinedload(Application.job).joinedload(Job.company),
            selectinload(Application.history),
        )
        .order_by(Application.last_updated.desc())
    )
    return db.scalars(statement).unique().all()


def get_application(db: Session, application_id: int):
    statement = (
        select(Application)
        .options(
            joinedload(Application.job).joinedload(Job.company),
            selectinload(Application.history),
        )
        .where(Application.id == application_id)
    )
    return db.scalar(statement)


def create_application(db: Session, data: ApplicationCreate):
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
    db.add(application)
    db.commit()
    return get_application(db, application.id)


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
    db.commit()
    return get_application(db, application.id)


def delete_application(db: Session, application: Application):
    db.delete(application)
    db.commit()


def dashboard(db: Session):
    rows = db.execute(
        select(Application.status, func.count(Application.id)).group_by(
            Application.status
        )
    ).all()
    counts = {status: count for status, count in rows}
    total = sum(counts.values())
    stale = (
        db.scalar(
            select(func.count(Application.id)).where(
                Application.status.notin_(["aprovado", "reprovado"]),
                Application.last_updated < now() - timedelta(days=7),
            )
        )
        or 0
    )
    return {
        "total": total,
        "aprovados": counts.get("aprovado", 0),
        "reprovados": counts.get("reprovado", 0),
        "em_andamento": total - counts.get("aprovado", 0) - counts.get("reprovado", 0),
        "sem_atualizacao": stale,
        "por_status": counts,
    }
