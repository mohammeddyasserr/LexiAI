from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

from ai_modules.contract_analysis.analys_contarct import analyze_contracts

router = APIRouter(prefix="/contract-analysis", tags=["ContractAnalysis"])

BASE_DIR = Path(__file__).resolve().parents[2]
RAW_DIR = BASE_DIR / "data" / "raw" / "uploads"
RAW_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/")
async def analyze_contracts_endpoint(
    contract_a: UploadFile = File(...),
    contract_b: UploadFile = File(...),
):
    if not contract_a.filename or not contract_b.filename:
        raise HTTPException(status_code=400, detail="Both files must be provided.")

    path_a = RAW_DIR / contract_a.filename
    path_b = RAW_DIR / contract_b.filename

    with open(path_a, "wb") as buf:
        shutil.copyfileobj(contract_a.file, buf)

    with open(path_b, "wb") as buf:
        shutil.copyfileobj(contract_b.file, buf)

    # Close uploaded file streams from Starlette
    contract_a.file.close()
    contract_b.file.close()

    try:
        result = analyze_contracts(str(path_a), str(path_b))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return result
