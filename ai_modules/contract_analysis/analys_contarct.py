from ai_modules.contract_analysis.comparison.clause_comparison import compare_clauses
from ai_modules.contract_analysis.comparison.recommendation import generate_recommendation
from ai_modules.contract_analysis.response_builder import build_final_response
from ai_modules.document_ai.extractor import extract_pages
#from ai_modules.document_ai.extractor import extract_clauses
from ai_modules.document_ai.extract_clauses_stub import extract_clauses
from ai_modules.legal_nlp.pipeline import sections_entities_pipeline

def analyze_contracts(
    contract_a_path,
    contract_b_path
):

    pages_a = extract_pages(contract_a_path)
    pages_b = extract_pages(contract_b_path)

    text_a = "\n".join(page["text"] for page in pages_a)
    text_b = "\n".join(page["text"] for page in pages_b)
    pipeline_a = sections_entities_pipeline(text_a)
    pipeline_b = sections_entities_pipeline(text_b)

# Convert sections list -> dictionary expected by the rest of the pipeline
    clauses_a = {
        section["type"]: section["text"]
        for section in pipeline_a["sections"]
    }

    clauses_b = {
        section["type"]: section["text"]
        for section in pipeline_b["sections"]
    }
   
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