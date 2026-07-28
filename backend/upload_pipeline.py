import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ai_modules.document_ai.pipeline import process_document
path = Path("../data/raw/contractA.pdf")

def upload_pipeline(pdf_path: str | Path):

    result = process_document(pdf_path)

    return result


result = upload_pipeline(path)

print(result)

upload_pipeline(path)