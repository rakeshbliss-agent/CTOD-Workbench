from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
UPLOAD_DIR = BASE_DIR / 'data' / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_upload(project_id: int, file: UploadFile) -> tuple[str, str]:
    safe_name = file.filename or 'upload.pdf'
    ext = Path(safe_name).suffix or '.pdf'
    stored_name = f'{project_id}_{uuid4().hex}{ext}'
    target = UPLOAD_DIR / stored_name
    with target.open('wb') as f:
        f.write(file.file.read())
    return stored_name, str(target)
