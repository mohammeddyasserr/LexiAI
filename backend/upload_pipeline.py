"""
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



path = "../data/raw/contractC.pdf"



def upload_pipeline(pdf_path: str | Path):

    noha = process_document(pdf_path, 1)


    full_text = noha["full_text"]


    aboelmagd = sections_entities_pipeline(full_text)


    sections = aboelmagd["sections"]


    raw_sections = aboelmagd["sections"]



    aboelmagd["sections"] = [
        {
            "title": section["type"],
            "text": section["text"],
            "page": 1
        }
        for section in raw_sections
    ]



    legal_info = LegalInfo(**aboelmagd)



    result = analyze_contract(sections)



    document = DocumentInput(**noha)



    vector_store.delete_collection()



    result = index_contract(
        document,
        legal_info
    )


    return result





print(
    upload_pipeline(path)
)



print("========== VECTOR CHECK ==========")



print(
    "Qdrant count:",
    vector_store.count()
)



results = vector_store.search(
    "payment period",
    limit=5
)



print(
    "Search results:",
    len(results)
)



for r in results:

    print(
        "Score:",
        r.score
    )

    print(
        "Text:",
        r.payload["text"]
    )



rag = RAGPipeline()



response = rag.answer_with_sources(
    "What are the termination rights of the parties?"
)



print(response)

"""