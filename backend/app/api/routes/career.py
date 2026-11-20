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
    CompanyUpdate,
    JobCreate,
    JobRead,
    JobUpdate,
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


@router.get("/companies/{company_id}", response_model=CompanyRead)
def company(company_id: int, db: DbSession):
    result = career.get_company(db, company_id)
    if not result:
        raise HTTPException(status_code=404, detail="Company not found.")
    return result


@router.patch("/companies/{company_id}", response_model=CompanyRead)
def edit_company(company_id: int, data: CompanyUpdate, db: DbSession):
    result = career.get_company(db, company_id)
    if not result:
        raise HTTPException(status_code=404, detail="Company not found.")
    try:
        return career.update_company(db, result, data)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="A company with this name already exists."
        ) from error


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_company(company_id: int, db: DbSession):
    result = career.get_company(db, company_id)
    if not result:
        raise HTTPException(status_code=404, detail="Company not found.")
    try:
        career.delete_company(db, result)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a company with applications linked to its jobs.",
        ) from error


@router.get("/jobs/", response_model=list[JobRead])
def jobs(db: DbSession):
    return career.list_jobs(db)


@router.post("/jobs/", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def add_job(data: JobCreate, db: DbSession):
    if not db.get(Company, data.company_id):
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
    return career.create_job(db, data)


@router.get("/jobs/{job_id}", response_model=JobRead)
def job(job_id: int, db: DbSession):
    result = career.get_job(db, job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job not found.")
    return result


@router.patch("/jobs/{job_id}", response_model=JobRead)
def edit_job(job_id: int, data: JobUpdate, db: DbSession):
    result = career.get_job(db, job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job not found.")
    if data.company_id is not None and not db.get(Company, data.company_id):
        raise HTTPException(status_code=404, detail="Company not found.")
    try:
        return career.update_job(db, result, data)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="Could not update job.") from error


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_job(job_id: int, db: DbSession):
    result = career.get_job(db, job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job not found.")
    try:
        career.delete_job(db, result)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Cannot delete a job with applications."
        ) from error


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
