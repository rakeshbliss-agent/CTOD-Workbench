from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class FieldConfigIn(BaseModel):
    id: str
    section: str
    name: str
    type: str
    required: bool
    automationMode: str
    notes: Optional[str] = None


class FieldConfigOut(BaseModel):
    id: str
    section: str
    name: str
    type: str
    required: bool
    automationMode: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    name: str
    indication: str
    template_name: str


class UploadedFileOut(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True


class ExtractionResultOut(BaseModel):
    id: int
    project_id: int
    file_id: int
    field_key: str
    field_name: str
    section: str
    extracted_value: Optional[str] = None
    evidence_snippet: Optional[str] = None
    page_number: Optional[int] = None
    confidence: float
    status: str
    created_at: datetime
    updated_at: datetime
    source_filename: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: int
    name: str
    indication: str
    template_name: str
    stage: str
    created_at: datetime
    updated_at: datetime
    files: list[UploadedFileOut] = []
    fields: list[FieldConfigOut] = []
    extraction_results: list[ExtractionResultOut] = []


class FieldSetRequest(BaseModel):
    fields: list[FieldConfigIn]
