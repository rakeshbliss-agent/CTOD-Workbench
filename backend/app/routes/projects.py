from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models import Project

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectCreateRequest(BaseModel):
    name: str
    indication: str
    template_name: str


def serialize_project(project: Project):
    return {
        "id": project.id,
        "name": project.name,
        "indication": project.indication,
        "template_name": project.template_name,
        "pdf_count": len(project.files or []),
        "stage": project.stage,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        "fields_json": [
            {
                "id": field.field_key,
                "section": field.section,
                "name": field.name,
                "type": field.field_type,
                "required": True if str(field.required).lower() == "true" else False,
                "automationMode": field.automation_mode,
                "notes": field.notes,
            }
            for field in (project.fields or [])
        ],
        "files": [
            {
                "id": file.id,
                "filename": file.filename,
                "original_filename": file.original_filename,
                "file_path": file.file_path,
                "created_at": file.created_at.isoformat() if file.created_at else None,
            }
            for file in (project.files or [])
        ],
    }


@router.get("")
def list_projects(db: Session = Depends(get_db)):
    projects = (
        db.query(Project)
        .options(joinedload(Project.files), joinedload(Project.fields))
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [serialize_project(project) for project in projects]


@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = (
        db.query(Project)
        .options(joinedload(Project.files), joinedload(Project.fields))
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return serialize_project(project)


@router.post("")
def create_project(payload: ProjectCreateRequest, db: Session = Depends(get_db)):
    now = datetime.utcnow()

    project = Project(
        name=payload.name,
        indication=payload.indication,
        template_name=payload.template_name,
        stage="Draft",
        created_at=now,
        updated_at=now,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    project = (
        db.query(Project)
        .options(joinedload(Project.files), joinedload(Project.fields))
        .filter(Project.id == project.id)
        .first()
    )

    return serialize_project(project)
