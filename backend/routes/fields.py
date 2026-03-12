from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import FieldDefinition, Project
from ..schemas import FieldSetRequest

router = APIRouter(prefix='/projects', tags=['fields'])


@router.post('/{project_id}/fields')
def save_fields(project_id: int, payload: FieldSetRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')

    db.query(FieldDefinition).filter(FieldDefinition.project_id == project_id).delete()

    for field in payload.fields:
        record = FieldDefinition(
            project_id=project_id,
            field_key=field.id,
            section=field.section,
            name=field.name,
            field_type=field.type,
            required='true' if field.required else 'false',
            automation_mode=field.automationMode,
        )
        db.add(record)

    project.stage = 'Configured'
    project.updated_at = datetime.utcnow()
    db.add(project)
    db.commit()
    return {'message': 'Field schema saved'}
