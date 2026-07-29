from ai_modules.contract_analysis.comparison.clause_comparison import compare_clauses
from ai_modules.contract_analysis.comparison.recommendation import generate_recommendation
from ai_modules.contract_analysis.response_builder import build_final_response
from ai_modules.document_ai.extractor import extract_pages
#from ai_modules.document_ai.extractor import extract_clauses
from ai_modules.document_ai.extract_clauses_stub import extract_clauses
from ai_modules.legal_nlp.pipeline import sections_entities_pipeline
from collections import defaultdict

def analyze_contracts(
    contract_a_path,
    contract_b_path
):

    pages_a = extract_pages(contract_a_path)
    pages_b = extract_pages(contract_b_path)

    text_a = "\n".join(page["text"] for page in pages_a)  # لسه محتاجينها لـ extract_entities
    text_b = "\n".join(page["text"] for page in pages_b)
    pipeline_a = sections_entities_pipeline(text_a, pages=pages_a)
    pipeline_b = sections_entities_pipeline(text_b, pages=pages_b)


# Convert sections list -> dictionary expected by the rest of the pipeline
    def group_sections_by_type(sections):
        grouped = defaultdict(list)
        for section in sections:
            grouped[section["type"]].append(section["text"])
        return {k: " ".join(v) for k, v in grouped.items()}

    clauses_a = group_sections_by_type(pipeline_a["sections"])
    clauses_b = group_sections_by_type(pipeline_b["sections"])
   
    comparison = compare_clauses(
        clauses_a,
        clauses_b
    )

    recommendation = generate_recommendation(
        comparison
    )

    # risk classification for both contracts now happens once,
    # inside build_final_response (it was previously duplicated here)
    final_response = build_final_response(
        contract_a_path,
        contract_b_path,
        clauses_a,
        clauses_b,
        comparison,
        recommendation
    )

    return final_response