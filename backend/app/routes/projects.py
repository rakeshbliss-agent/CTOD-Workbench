from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import FieldDefinition, Project
from ..schemas import FieldConfigOut, ProjectCreate, ProjectOut

router = APIRouter(prefix='/projects', tags=['projects'])


def serialize_project(project: Project) -> ProjectOut:
    return ProjectOut(
        id=project.id,
        name=project.name,
        indication=project.indication,
        template_name=project.template_name,
        stage=project.stage,
        created_at=project.created_at,
        updated_at=project.updated_at,
        files=project.files,
        fields=[
            FieldConfigOut(
                id=field.field_key,
                section=field.section,
                name=field.name,
                type=field.field_type,
                required=field.required.lower() == 'true',
                automationMode=field.automation_mode,
            )
            for field in project.fields
        ],
    )


@router.get('', response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).options(selectinload(Project.files), selectinload(Project.fields)).order_by(Project.created_at.desc()).all()
    return [serialize_project(project) for project in projects]


@router.post('', response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    project = Project(
        name=payload.name,
        indication=payload.indication,
        template_name=payload.template_name,
        stage='Draft',
        created_at=now,
        updated_at=now,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    project = db.query(Project).options(selectinload(Project.files), selectinload(Project.fields)).get(project.id)
    return serialize_project(project)


@router.get('/{project_id}', response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).options(selectinload(Project.files), selectinload(Project.fields)).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    return serialize_project(project)
