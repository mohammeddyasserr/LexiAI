
import sys
import json
from pathlib import Path
from datetime import date
from urllib import response
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
from ai_modules.rag_system.rag_pipeline import RAGPipeline
import json
from pathlib import Path

OUTPUT_FILE = Path("../data/contracts.json")


path=("../data/raw/contractC.pdf")

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


def upload_pipeline(pdf_path: str | Path, title: str):
    metadata = {
    "contract_id": "none",
    "title": title,
    "upload_date": date.today().isoformat(),
    }
    if Path(OUTPUT_FILE).exists():
      with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        contracts = json.load(f)
    else:
      contracts = []
    metadata["contract_id"] = f"CNT{len(contracts) + 1:03d}"

    noha = process_document(pdf_path, metadata["contract_id"])
    full_text = noha["full_text"]
    pages = noha["pages"]

    aboelmagd = sections_entities_pipeline(full_text, pages)
    raw_sections = aboelmagd["sections"]
    entities = aboelmagd["entities"]
    print(raw_sections)
    aboelmagd["sections"] = [
        {
            "title": section["type"],
            "text": section["text"],
            "page": section["page no."]
        }
        for section in raw_sections
    ]

    # result = analyze_contract(raw_sections)
    # risks = {
    #     "risk_score": result["risk_score"],
    #     "risks": result["risks"],
    # }

    # report = generate_report(metadata, full_text, raw_sections, risks)
    

    legal_info = LegalInfo(**aboelmagd)
    document = DocumentInput(**noha)
    result = index_contract(document, legal_info)
    print(result)

    rag = RAGPipeline()

    response = rag.answer_with_sources(
        "What are the termination rights of the parties?"
    )

    print(response)


    # contract_record = {
    # "metadata": metadata,
    # "full_text": full_text,
    # "pages": pages,
    # "sections": aboelmagd["sections"],
    # "entities": entities,
    # "risks": risks,
    # "report": report,
    # }

    # save_contract(contract_record)
   
    return {
        "status": "success",
        "message": "Contract processed and saved successfully.",
        # "contract_id": metadata["contract_id"],
    }

print(upload_pipeline(path, "File2"))
