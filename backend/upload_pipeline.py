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
import json
from pathlib import Path

OUTPUT_FILE = Path("../data/contracts.json")


path=("../data/raw/contracts.pdf")

def save_contract(contract_data: dict):
    # لو الملف موجود اقرأ البيانات القديمة
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            try:
                contracts = json.load(f)
            except json.JSONDecodeError:
                contracts = []
    else:
        contracts = []

    # أضف العقد الجديد
    contracts.append(contract_data)

    # اكتب الملف مرة تانية
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(contracts, f, indent=4, ensure_ascii=False)


def upload_pipeline(pdf_path: str | Path):
    metadata = {
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

    contract_record = {
    "metadata": metadata,
    "full_text": full_text,
    "pages": pages,
    "sections": raw_sections,
    "entities": entities,
    "risks": risks,
    "report": report,
    }

    save_contract(contract_record)

    return {
        "status": "success",
        "message": "Contract processed and saved successfully.",
        "contract_id": metadata["contract_id"],
    }

print(upload_pipeline(path))
