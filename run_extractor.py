from pathlib import Path

from ai_modules.document_ai.pipeline import run_full_pipeline


input_folder = Path("data/raw")
pdf_files = sorted(input_folder.glob("*.pdf"))

for pdf_path in pdf_files:
    try:
        run_full_pipeline(pdf_path)
        print(f"Processed {pdf_path.name}")
    except Exception as error:
        print(f"Failed {pdf_path.name}: {error}")
