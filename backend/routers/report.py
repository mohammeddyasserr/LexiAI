from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
router = APIRouter()

CONTRACTS_FILE = Path("../data/contracts.json")


@router.get("/report/{contract_id}")
def get_report(contract_id: str):

    if not CONTRACTS_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="contracts.json not found"
        )

    with open(CONTRACTS_FILE, "r", encoding="utf-8") as f:
        contracts = json.load(f)

    for contract in contracts:

        if contract["metadata"]["contract_id"] == contract_id:

            return contract["report"]

    raise HTTPException(
        status_code=404,
        detail=f"Contract '{contract_id}' not found"
    )