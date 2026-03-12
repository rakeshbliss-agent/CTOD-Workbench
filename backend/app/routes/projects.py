from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import Project
from ..schemas import ExtractionResultOut, FieldConfigOut, ProjectCreate, ProjectOut

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
                notes=field.notes,
            )
            for field in project.fields
        ],
        extraction_results=[
            ExtractionResultOut(
                id=item.id,
                project_id=item.project_id,
                file_id=item.file_id,
                field_key=item.field_key,
                field_name=item.field_name,
                section=item.section,
                extracted_value=item.extracted_value,
                evidence_snippet=item.evidence_snippet,
                page_number=item.page_number,
                confidence=item.confidence,
                status=item.status,
                created_at=item.created_at,
                updated_at=item.updated_at,
                source_filename=item.file.original_filename if item.file else None,
            )
            for item in project.extraction_results
        ],
    )


@router.get('', response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = (
        db.query(Project)
        .options(
            selectinload(Project.files),
            selectinload(Project.fields),
            selectinload(Project.extraction_results).selectinload('file'),
        )
        .order_by(Project.created_at.desc())
        .all()
    )
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

    project = (
        db.query(Project)
        .options(
            selectinload(Project.files),
            selectinload(Project.fields),
            selectinload(Project.extraction_results).selectinload('file'),
        )
        .filter(Project.id == project.id)
        .first()
    )
    return serialize_project(project)


@router.get('/{project_id}', response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = (
        db.query(Project)
        .options(
            selectinload(Project.files),
            selectinload(Project.fields),
            selectinload(Project.extraction_results).selectinload('file'),
        )
        .filter(Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    return serialize_project(project)
