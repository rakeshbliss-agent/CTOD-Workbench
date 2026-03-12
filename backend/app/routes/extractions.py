from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import ExtractionResult, Project
from ..schemas import ExtractionResultOut
from ..services.extractor import extract_pages_from_pdf, find_field_match

router = APIRouter(prefix='/projects', tags=['extractions'])


@router.post('/{project_id}/extract')
def run_extraction(project_id: int, db: Session = Depends(get_db)):
    project = (
        db.query(Project)
        .options(
            selectinload(Project.files),
            selectinload(Project.fields),
            selectinload(Project.extraction_results),
        )
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail='Project not found')

    if not project.files:
        raise HTTPException(status_code=400, detail='No PDF files uploaded for this project')

    if not project.fields:
        raise HTTPException(status_code=400, detail='No fields configured for this project')

    existing_results = db.query(ExtractionResult).filter(ExtractionResult.project_id == project_id).all()
    for item in existing_results:
        db.delete(item)
    db.flush()

    created_count = 0

    for uploaded_file in project.files:
        pages = extract_pages_from_pdf(uploaded_file.file_path)

        for field in project.fields:
            match = find_field_match(field.name, field.section, pages)

            result = ExtractionResult(
                project_id=project.id,
                file_id=uploaded_file.id,
                field_key=field.field_key,
                field_name=field.name,
                section=field.section,
                extracted_value=match['extracted_value'],
                evidence_snippet=match['evidence_snippet'],
                page_number=match['page_number'],
                confidence=match['confidence'],
                status='Draft',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(result)
            created_count += 1

    project.stage = 'Extracted'
    project.updated_at = datetime.utcnow()
    db.add(project)
    db.commit()

    return {
        'message': 'Extraction completed',
        'project_id': project.id,
        'results_created': created_count,
    }


@router.get('/{project_id}/extractions', response_model=list[ExtractionResultOut])
def list_extractions(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')

    results = (
        db.query(ExtractionResult)
        .options(selectinload(ExtractionResult.file))
        .filter(ExtractionResult.project_id == project_id)
        .order_by(ExtractionResult.section.asc(), ExtractionResult.field_name.asc())
        .all()
    )

    return [
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
        for item in results
    ]
