from datetime import datetime
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Project, UploadedFile as UploadedFileModel
from ..services.storage import save_upload

router = APIRouter(prefix='/projects', tags=['uploads'])


@router.post('/{project_id}/upload')
def upload_file(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    if not (file.filename or '').lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='Only PDF files are supported in Part 1')

    stored_name, file_path = save_upload(project_id, file)
    record = UploadedFileModel(
        project_id=project_id,
        filename=stored_name,
        original_filename=file.filename or stored_name,
        file_path=file_path,
        created_at=datetime.utcnow(),
    )
    project.stage = 'Files Uploaded'
    project.updated_at = datetime.utcnow()
    db.add(record)
    db.add(project)
    db.commit()
    db.refresh(record)
    return {'message': 'File uploaded successfully', 'file_id': record.id}
