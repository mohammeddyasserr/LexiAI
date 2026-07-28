import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ai_modules.document_ai.pipeline import process_document
from ai_modules.legal_nlp.pipeline import sections_entities_pipeline
from ai_modules.risk_analysis.risk_pipeline import analyze_contract
from ai_modules.rag_system.api import index_contract
from ai_modules.rag_system.schemas import DocumentInput, LegalInfo
from ai_modules.rag_system.rag_pipeline import RAGPipeline
from ai_modules.rag_system.services import vector_store
from ai_modules.rag_system.services import VectorStore
from ai_modules.llm_assistant.report_pipeline import generate_report


path=("../data/raw/contractC.pdf")

def upload_pipeline(pdf_path: str | Path):
    metadata =  {
    "contract_id": "CNT001",
    "title": "Supplier Agreement",
    "contract_type": "Procurement",
    "upload_date": "2026-07-27",
    "language": "English",
    "status": "Processed"
  }
    noha = process_document(pdf_path, 1)
    full_text = noha["full_text"]
    pages = noha["pages"]

    aboelmagd = sections_entities_pipeline(full_text)
    raw_sections = aboelmagd["sections"]
    entities = aboelmagd["entities"]
    aboelmagd["sections"] = [
        {
            "title": section["type"],
            "text": section["text"],
            "page": 1
        }
        for section in raw_sections
    ]

    result = analyze_contract(raw_sections)
    risk_score = result["risk_score"]
    risks = result["risks"]

    result = generate_report(metadata,full_text,raw_sections,risks)


    legal_info = LegalInfo(**aboelmagd)
    document = DocumentInput(**noha)
    # result = index_contract(document, legal_info)


    return result

print(upload_pipeline(path))

# print("========== VECTOR CHECK ==========")

# print("Qdrant count:", vector_store.count())

# results = vector_store.search(
#     "payment period",
#     limit=5
# )

# print("Search results:", len(results))

# for r in results:
#     print("Score:", r.score)
#     print("Text:", r.payload["text"])

# rag = RAGPipeline()

# response = rag.answer_with_sources(
#     "What is the payment period?"
# )
# print(response)