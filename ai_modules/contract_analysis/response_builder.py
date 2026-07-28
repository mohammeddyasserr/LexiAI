import json
import re

from ai_modules.risk_analysis.classifier import classify_clause_risk


def clean_json_output(text):

    if isinstance(text, (dict, list)):
        return text

    text = re.sub(
        r"```json|```",
        "",
        text
    ).strip()

    return json.loads(text)


def build_final_response(
    contract_a,
    contract_b,
    clauses_a,
    clauses_b,
    comparison,
    recommendation
):

    risk_a = {}

    for name, clause in clauses_a.items():

        clause_text = " ".join(
            str(value)
            for value in clause.values()
        ) if isinstance(clause, dict) else str(clause)

        risk_a[name] = classify_clause_risk(clause_text)


    risk_b = {}

    for name, clause in clauses_b.items():

        clause_text = " ".join(
            str(value)
            for value in clause.values()
        ) if isinstance(clause, dict) else str(clause)

        risk_b[name] = classify_clause_risk(clause_text)


    return {

        "contracts": {

            "contract_a": {
                "name": contract_a,
                "risk_analysis": risk_a
            },

            "contract_b": {
                "name": contract_b,
                "risk_analysis": risk_b
            }

        },

        "comparison": comparison,

        "recommendation": clean_json_output(recommendation)

    }