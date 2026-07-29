from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter(prefix="/risk", tags=["Risk Analysis"])

CONTRACTS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "contracts.json"


@router.get("/{contract_id}")
def get_risk(contract_id: str):

    if not CONTRACTS_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="contracts.json not found"
        )

    with open(CONTRACTS_FILE, "r", encoding="utf-8") as f:
        contracts = json.load(f)

    for contract in contracts:
        if contract["metadata"]["contract_id"] == contract_id:
            return {
                "contract_id": contract_id,
                "risk_score": contract["risks"]["risk_score"],
                "risks": contract["risks"]["risks"]
            }

    raise HTTPException(
        status_code=404,
        detail="Contract not found"
    )