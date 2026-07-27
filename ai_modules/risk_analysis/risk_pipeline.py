from typing import Dict, List

from rules import run_rule_based_checks, check_missing_clauses
from classifier import classify_clause_risk


SEVERITY_PROBABILITY = {
    "High": 0.40,
    "Medium": 0.20,
    "Low": 0.05,
}

MIN_LENGTH_FOR_MODEL = 15


def compute_score(risks: List[Dict]) -> float:
    if not risks:
        return 5.0

    survival = 1.0

    for risk in risks:
        p = SEVERITY_PROBABILITY.get(risk["severity"], 0.20)
        survival *= (1 - p)

    return round(100 * (1 - survival), 1)


def analyze_contract(contract_json: Dict, use_model: bool = True) -> Dict:
    """
    Input:

    {
        "contract_id":"CNT001",
        "clauses":[
            {
                "type":"Payment",
                "text":"...."
            },
            ...
        ]
    }

    Output:

    {
        "contract_id":"CNT001",
        "risk_score":84.6,
        "risks":[...]
    }
    """

    contract_id = contract_json.get("contract_id", "UNKNOWN")
    clauses = contract_json.get("clauses", [])

    if not clauses:
        return {
            "contract_id": contract_id,
            "risk_score": 0,
            "risks": []
        }

    all_risks = []

    flagged = set()

    # ---------------- Rule-Based ----------------

    for idx, clause in enumerate(clauses):

        clause_risks = run_rule_based_checks(clause["text"])

        if clause_risks:
            all_risks.extend(clause_risks)
            flagged.add(idx)

    # ---------------- Missing Clauses ----------------

    clause_types = [c["type"] for c in clauses]

    all_risks.extend(
        check_missing_clauses(clause_types)
    )

    # ---------------- LLM ----------------

    if use_model:

        for idx, clause in enumerate(clauses):

            if idx in flagged:
                continue

            if len(clause["text"]) < MIN_LENGTH_FOR_MODEL:
                continue

            result = classify_clause_risk(
                clause["text"]
            )

            

            all_risks.append({

                "type": result["risk_type"],

                "severity": result["severity"],

                "clause": clause["type"],

                "reason": result["reason"]

            })

    score = compute_score(all_risks)

    return {

        "contract_id": contract_id,

        "risk_score": score,

        "risks": all_risks

    }