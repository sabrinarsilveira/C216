from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.career import Company, Job
from app.schemas.career import (
    ApplicationCreate,
    ApplicationRead,
    ApplicationUpdate,
    CompanyCreate,
    CompanyRead,
    JobCreate,
    JobRead,
)
from app.services import career

DbSession = Annotated[Session, Depends(get_db)]
router = APIRouter(tags=["vagas e candidaturas"])


@router.get("/companies/", response_model=list[CompanyRead])
def companies(db: DbSession):
    return career.list_companies(db)


@router.post(
    "/companies/", response_model=CompanyRead, status_code=status.HTTP_201_CREATED
)
def add_company(data: CompanyCreate, db: DbSession):
    try:
        return career.create_company(db, data)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Esta empresa já está cadastrada."
        ) from error


@router.get("/jobs/", response_model=list[JobRead])
def jobs(db: DbSession):
    return career.list_jobs(db)


@router.post("/jobs/", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def add_job(data: JobCreate, db: DbSession):
    if not db.get(Company, data.company_id):
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
    return career.create_job(db, data)


@router.get("/applications/", response_model=list[ApplicationRead])
def applications(db: DbSession):
    return career.list_applications(db)


@router.post(
    "/applications/",
    response_model=ApplicationRead,
    status_code=status.HTTP_201_CREATED,
)
def add_application(data: ApplicationCreate, db: DbSession):
    if not db.get(Job, data.job_id):
        raise HTTPException(status_code=404, detail="Vaga não encontrada.")
    return career.create_application(db, data)


@router.get("/applications/{application_id}", response_model=ApplicationRead)
def application(application_id: int, db: DbSession):
    result = career.get_application(db, application_id)
    if not result:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada.")
    return result


@router.patch("/applications/{application_id}", response_model=ApplicationRead)
def edit_application(application_id: int, data: ApplicationUpdate, db: DbSession):
    result = career.get_application(db, application_id)
    if not result:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada.")
    try:
        return career.update_application(db, result, data)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_application(application_id: int, db: DbSession):
    result = career.get_application(db, application_id)
    if not result:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada.")
    career.delete_application(db, result)


@router.get("/dashboard/")
def get_dashboard(db: DbSession):
    return career.dashboard(db)
