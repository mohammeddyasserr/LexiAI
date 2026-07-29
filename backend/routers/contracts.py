from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter(prefix="/contracts", tags=["Contracts"])

CONTRACTS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "contracts.json"


def get_risk_label(score: float):
    if score >= 90:
        return "Critical"
    elif score >= 70:
        return "High Risk"
    elif score >= 40:
        return "Medium Risk"
    else:
        return "Low Risk"


@router.get("")
def get_contracts():

    if not CONTRACTS_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="contracts.json not found"
        )

    with open(CONTRACTS_FILE, "r", encoding="utf-8") as f:
        contracts = json.load(f)

    result = []

    for contract in contracts:

        metadata = contract.get("metadata", {})
        report = contract.get("report", {})
        header = report.get("header", {})
        risks = contract.get("risks", {})

        score = risks.get("risk_score", 0)

        parties = []

        party_1 = header.get("party_1")
        party_2 = header.get("party_2")

        if party_1:
            parties.append(party_1)

        if party_2:
            parties.append(party_2)

        value = header.get("contract_value")

        result.append({
            "contract_id": metadata.get("contract_id"),
            "title": header.get("title"),
            "parties": ".".join(parties) if parties else None,
            "value": value if value else None,
            "date": metadata.get("upload_date"),
            "risk": get_risk_label(score)
        })

    return result