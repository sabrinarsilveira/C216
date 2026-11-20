from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ApplicationStatus(StrEnum):
    INSCRITO = "inscrito"
    TRIAGEM = "triagem"
    ENTREVISTA = "entrevista"
    TESTE_TECNICO = "teste_tecnico"
    APROVADO = "aprovado"
    REPROVADO = "reprovado"


class CompanyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    website: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=500)

    @field_validator("name", mode="before")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = value.strip() if isinstance(value, str) else value
        if isinstance(cleaned, str) and not cleaned:
            raise ValueError("Informe o nome da empresa.")
        return cleaned


class CompanyRead(CompanyCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class JobCreate(BaseModel):
    company_id: int
    title: str = Field(min_length=2, max_length=150)
    location: str = Field(default="Remoto", min_length=2, max_length=120)
    work_mode: str = Field(default="remoto", pattern="^(remoto|hibrido|presencial)$")
    salary_range: str | None = Field(default=None, max_length=100)
    url: str | None = Field(default=None, max_length=500)
    description: str | None = None

    @field_validator("title", "location", mode="before")
    @classmethod
    def clean_text(cls, value: str) -> str:
        cleaned = value.strip() if isinstance(value, str) else value
        if isinstance(cleaned, str) and not cleaned:
            raise ValueError("Este campo não pode ficar vazio.")
        return cleaned


class JobRead(JobCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    company: CompanyRead


class ApplicationCreate(BaseModel):
    job_id: int
    applied_on: date
    interview_at: datetime | None = None
    notes: str | None = None

    @model_validator(mode="after")
    def interview_not_before_application(self):
        if self.interview_at and self.interview_at.date() < self.applied_on:
            raise ValueError(
                "A entrevista não pode ser anterior à data da candidatura."
            )
        return self


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus | None = None
    interview_at: datetime | None = None
    notes: str | None = None


class HistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    from_status: str | None
    to_status: str
    note: str | None
    changed_at: datetime


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    job_id: int
    status: str
    applied_on: date
    interview_at: datetime | None
    notes: str | None
    last_updated: datetime
    job: JobRead
    history: list[HistoryRead]
