import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ai_modules.document_ai.pipeline import process_document
path=("data/raw/contractA.pdf")

def upload_pipeline(pdf_path: str | Path):

    process_document(pdf_path)





    return "mohammed"

upload_pipeline(path)