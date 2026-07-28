from ai_modules.contract_analysis.comparison.clause_comparison import compare_clauses
from ai_modules.contract_analysis.comparison.recommendation import generate_recommendation
from ai_modules.contract_analysis.response_builder import build_final_response
from ai_modules.document_ai.extractor import extract_pages
from ai_modules.risk_analysis.classifier import classify_clause_risk
from .extraction.clause_extraction import extract_clauses


def analyze_contracts(
    contract_a_path,
    contract_b_path
):

    pages_a = extract_pages(contract_a_path)
    pages_b = extract_pages(contract_b_path)


    text_a = "\n".join(
        page["text"]
        for page in pages_a
    )

    text_b = "\n".join(
        page["text"]
        for page in pages_b
    )


    clauses_a = extract_clauses(text_a)
    clauses_b = extract_clauses(text_b)


    comparison = compare_clauses(
        clauses_a,
        clauses_b
    )


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



    recommendation = generate_recommendation(
        comparison
    )


    final_response = build_final_response(
        contract_a_path,
        contract_b_path,
        comparison,
        recommendation,
        risk_a,
        risk_b
    )


    return final_response