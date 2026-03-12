from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from .db import Base


class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    indication = Column(String(255), nullable=False)
    template_name = Column(String(255), nullable=False)
    stage = Column(String(50), nullable=False, default='Draft')
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    files = relationship('UploadedFile', back_populates='project', cascade='all, delete-orphan')
    fields = relationship('FieldDefinition', back_populates='project', cascade='all, delete-orphan')


class UploadedFile(Base):
    __tablename__ = 'uploaded_files'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship('Project', back_populates='files')


class FieldDefinition(Base):
    __tablename__ = 'field_definitions'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    field_key = Column(String(255), nullable=False)
    section = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    field_type = Column(String(50), nullable=False)
    required = Column(String(10), nullable=False, default='false')
    automation_mode = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)

    project = relationship('Project', back_populates='fields')
