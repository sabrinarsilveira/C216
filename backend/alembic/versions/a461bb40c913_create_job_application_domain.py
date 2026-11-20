"""Create the career tracking domain."""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "a461bb40c913"
down_revision: str | Sequence[str] | None = "7ac32d03e241"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False, unique=True),
        sa.Column("website", sa.String(255)),
        sa.Column("notes", sa.String(500)),
    )
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "company_id",
            sa.Integer(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column("location", sa.String(120), nullable=False, server_default="Remoto"),
        sa.Column("work_mode", sa.String(20), nullable=False, server_default="remoto"),
        sa.Column("salary_range", sa.String(100)),
        sa.Column("url", sa.String(500)),
        sa.Column("description", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "applications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "job_id",
            sa.Integer(),
            sa.ForeignKey("jobs.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("status", sa.String(24), nullable=False, server_default="inscrito"),
        sa.Column("applied_on", sa.Date(), nullable=False),
        sa.Column("interview_at", sa.DateTime(timezone=True)),
        sa.Column("notes", sa.Text()),
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "application_history",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "application_id",
            sa.Integer(),
            sa.ForeignKey("applications.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("from_status", sa.String(24)),
        sa.Column("to_status", sa.String(24), nullable=False),
        sa.Column("note", sa.String(500)),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("application_history")
    op.drop_table("applications")
    op.drop_table("jobs")
    op.drop_table("companies")
