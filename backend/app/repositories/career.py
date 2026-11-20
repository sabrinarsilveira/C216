from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.career import Application, Company, Job


def list_companies(db: Session):
    return db.scalars(select(Company).order_by(Company.name)).all()


def get_company(db: Session, company_id: int):
    return db.get(Company, company_id)


def add_company(db: Session, company: Company):
    db.add(company)
    db.flush()
    return company


def update_company(db: Session, company: Company, values: dict):
    for key, value in values.items():
        setattr(company, key, value)
    db.flush()
    return company


def delete_company(db: Session, company: Company):
    db.delete(company)
    db.flush()


def list_jobs(db: Session):
    statement = (
        select(Job).options(joinedload(Job.company)).order_by(Job.created_at.desc())
    )
    return db.scalars(statement).unique().all()


def get_job(db: Session, job_id: int):
    statement = select(Job).options(joinedload(Job.company)).where(Job.id == job_id)
    return db.scalar(statement)


def add_job(db: Session, job: Job):
    db.add(job)
    db.flush()
    return job


def update_job(db: Session, job: Job, values: dict):
    for key, value in values.items():
        setattr(job, key, value)
    db.flush()
    return job


def delete_job(db: Session, job: Job):
    db.delete(job)
    db.flush()


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


def add_application(db: Session, application: Application):
    db.add(application)
    db.flush()
    return application


def save_application(db: Session, application: Application):
    db.flush()
    return application


def delete_application(db: Session, application: Application):
    db.delete(application)
    db.flush()


def count_applications_by_status(db: Session):
    rows = db.execute(
        select(Application.status, func.count(Application.id)).group_by(
            Application.status
        )
    ).all()
    return dict(rows)


def count_stale_applications(db: Session, cutoff: datetime):
    return (
        db.scalar(
            select(func.count(Application.id)).where(
                Application.status.notin_(["aprovado", "reprovado"]),
                Application.last_updated < cutoff,
            )
        )
        or 0
    )
