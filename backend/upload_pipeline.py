import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ai_modules.document_ai.pipeline import process_document
from ai_modules.legal_nlp.pipeline import sections_entities_pipeline

path=("../data/raw/contractC.pdf")

def upload_pipeline(pdf_path: str | Path):

    result=process_document(pdf_path)
    full_text= result['full_text']
    pages=result['pages']   

    result=sections_entities_pipeline(full_text)
    sections=result['sections']
    entities=result['entities']



    return sections,entities

print(upload_pipeline(path))
