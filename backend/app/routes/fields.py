from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
import json

from app.db import get_db
from app.models import Project

router = APIRouter(prefix="/projects", tags=["fields"])


class FieldItem(BaseModel):
    id: str
    section: str
    name: str
    type: str
    required: bool
    automationMode: str


class SaveFieldsRequest(BaseModel):
    fields: List[FieldItem]


@router.post("/{project_id}/fields")
def save_fields(project_id: int, payload: SaveFieldsRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.fields_json = json.dumps([field.model_dump() for field in payload.fields])

    if not project.stage:
        project.stage = "Configured"
    else:
        project.stage = "Configured"

    db.commit()
    db.refresh(project)

    return {
        "success": True,
        "project_id": project.id,
        "stage": project.stage,
        "fields_count": len(payload.fields),
    }
