from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import shutil

from backend.upload_pipeline import upload_pipeline

router = APIRouter(prefix="/contracts", tags=["Contracts"])

BASE_DIR = Path(__file__).resolve().parents[2]   # project root
RAW_DIR = BASE_DIR / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_contract(
    title: str = Form(...),
    file: UploadFile = File(...)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are allowed.")

    file_path = RAW_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return upload_pipeline(file_path, title)