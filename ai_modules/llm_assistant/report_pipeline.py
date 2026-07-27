from report_sections import (
    extract_metadata,
    generate_header,
    generate_kpi_cards,
    generate_summary,
    generate_key_findings,
    generate_important_clauses,
    generate_risk_analysis,
    generate_recommendations,
)

def generate_report(
    metadata,
    contract_text,
    clauses,
    risks,
):
    extracted_info=extract_metadata(contract_text)

    # Header
    header = generate_header(metadata,extracted_info,)

    # KPI Cards
    kpi_cards = generate_kpi_cards(clauses, risks)

    # Executive Summary
    summary = generate_summary(metadata,contract_text,extracted_info,clauses,risks)

    # Key Findings
    key_findings=generate_key_findings(summary,risks,clauses)

    # Important Clauses
    important_clauses = generate_important_clauses(summary,risks,clauses)

    # Risk Analysis
    risk_analysis = generate_risk_analysis(summary,risks,clauses)

    # Recommendations
    recommendations = generate_recommendations(summary,risk_analysis,risks,clauses)

    return {
        "header": header,
        "kpi_cards": kpi_cards,
        "executive_summary": summary,
        "key_findings": key_findings,
        "important_clauses": important_clauses,
        "risk_analysis": risk_analysis,
        "recommendations": recommendations,
    }