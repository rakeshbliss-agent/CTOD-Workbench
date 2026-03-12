from datetime import datetime
from pydantic import BaseModel


class FieldConfigIn(BaseModel):
    id: str
    section: str
    name: str
    type: str
    required: bool
    automationMode: str


class FieldConfigOut(BaseModel):
    id: str
    section: str
    name: str
    type: str
    required: bool
    automationMode: str

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


class FieldSetRequest(BaseModel):
    fields: list[FieldConfigIn]
