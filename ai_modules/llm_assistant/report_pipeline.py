from .report_sections import (
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
    print("starting to generate report")
    extracted_info=extract_metadata(contract_text)
    print("done extracting metadata")
    # Header
    header = generate_header(metadata,extracted_info)
    print("done generating header")
    # KPI Cards
    kpi_cards = generate_kpi_cards(clauses, risks)
    print("done generating KPI cards")
    # Executive Summary
    summary = generate_summary(metadata,contract_text,extracted_info,clauses,risks)
    print("done generating executive summary")
    # Key Findings
    key_findings=generate_key_findings(summary,risks,clauses)
    print("done generating key findings")
    # Important Clauses
    important_clauses = generate_important_clauses(summary,risks,clauses)
    print("done generating important clauses")
    # Risk Analysis
    risk_analysis = generate_risk_analysis(summary,risks,clauses)
    print("done generating risk analysis")
    # Recommendations
    recommendations = generate_recommendations(summary,risk_analysis,risks,clauses)
    print("done generating recommendations")
    print("---------the report generated successfully---------")
    return {
        "header": header,
        "kpi_cards": kpi_cards,
        "executive_summary": summary,
        "key_findings": key_findings,
        "important_clauses": important_clauses,
        "risk_analysis": risk_analysis,
        "recommendations": recommendations,
    }