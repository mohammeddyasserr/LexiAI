import sys
import json
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
from ai_modules.contract_analysis.analys_contarct import analyze_contracts



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
    risks = {
        "risk_score": result["risk_score"],
        "risks": result["risks"],
    }

    report = generate_report(metadata, full_text, raw_sections, risks)
    

    legal_info = LegalInfo(**aboelmagd)
    document = DocumentInput(**noha)
    result = index_contract(document, legal_info)


    return result

print(upload_pipeline(path))
