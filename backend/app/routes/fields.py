from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import FieldDefinition, Project

router = APIRouter(prefix="/projects", tags=["fields"])


class FieldItem(BaseModel):
    id: str
    section: str
    name: str
    type: str
    required: bool
    automationMode: str
    notes: Optional[str] = None


class SaveFieldsRequest(BaseModel):
    fields: List[FieldItem]


@router.post("/{project_id}/fields")
def save_fields(
    project_id: int,
    payload: SaveFieldsRequest,
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing_fields = (
        db.query(FieldDefinition)
        .filter(FieldDefinition.project_id == project_id)
        .all()
    )

    for field in existing_fields:
        db.delete(field)

    db.flush()

    for item in payload.fields:
        new_field = FieldDefinition(
            project_id=project_id,
            field_key=item.id,
            section=item.section,
            name=item.name,
            field_type=item.type,
            required="true" if item.required else "false",
            automation_mode=item.automationMode,
            notes=item.notes,
        )
        db.add(new_field)

    project.stage = "Configured"
    project.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(project)

    return {
        "success": True,
        "project_id": project.id,
        "stage": project.stage,
        "fields_count": len(payload.fields),
    }
