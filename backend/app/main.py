from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routes import extractions, fields, projects, uploads

Base.metadata.create_all(bind=engine)

app = FastAPI(title='CTOD Prototype Backend', version='0.2.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(projects.router)
app.include_router(uploads.router)
app.include_router(fields.router)
app.include_router(extractions.router)


@app.get('/health')
def health_check():
    return {'status': 'ok'}
