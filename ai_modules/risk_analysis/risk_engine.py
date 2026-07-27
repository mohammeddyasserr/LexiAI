from typing import List, Dict
from sqlalchemy.orm import Session

from app.models import Clause, Risk
from app.rules import run_rule_based_checks, check_missing_clauses
from app.classifier import classify_clause_risk

SEVERITY_PROBABILITY = {
    "High": 0.40,
    "Medium": 0.20,
    "Low": 0.05,
}

MIN_LENGTH_FOR_MODEL = 15


def _compute_score(risks: List[Dict]) -> float:
   
    if not risks:
        return 5.0 

    survival_prob = 1.0
    for r in risks:
        p = SEVERITY_PROBABILITY.get(r["severity"], 0.2)
        survival_prob *= (1 - p)

    score = 100.0 * (1 - survival_prob)
    return round(score, 1)


def analyze_contract(contract_id: str, db: Session, use_model: bool = True) -> Dict:
    
    clauses = db.query(Clause).filter(Clause.contract_id == contract_id).all()

    if not clauses:
        return {
            "contract_id": contract_id,
            "risk_score": 0.0,
            "risks": [],
            "note": "No clauses found for this contract. Run Member 1 & 2 pipelines first.",
        }

    all_risks: List[Dict] = []

    clauses_flagged_by_rules = set()

    for clause in clauses:
        clause_risks = run_rule_based_checks(clause.text)
        if clause_risks:
            all_risks += clause_risks
            clauses_flagged_by_rules.add(clause.id)


    existing_types = [c.clause_type for c in clauses]
    all_risks += check_missing_clauses(existing_types)


    if use_model:
        for clause in clauses:
            if clause.id in clauses_flagged_by_rules:
                continue
            if len(clause.text) < MIN_LENGTH_FOR_MODEL:
                continue
            result = classify_clause_risk(clause.text)
            
            if (
                result.get("risk_type", "None") != "None"
                and result.get("severity") in ("High", "Medium")
            ):
                all_risks.append({
                    "type": result["risk_type"],
                    "severity": result["severity"],
                    "clause": clause.clause_type,
                    "reason": result.get("reason", "Risk detected by the language model."),
                })

    risk_score = _compute_score(all_risks)


    db.query(Risk).filter(Risk.contract_id == contract_id).delete()
    for r in all_risks:
        db.add(Risk(
            contract_id=contract_id,
            score=risk_score,
            risk_type=r["type"],
            severity=r["severity"],
            clause_type=r.get("clause"),
            reason=r["reason"],
        ))
    db.commit()

    return {
        "contract_id": contract_id,
        "risk_score": risk_score,
        "risks": all_risks,
    }
