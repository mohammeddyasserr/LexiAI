from pathlib import Path
from .json_writer import save_result_to_json
from .preprocessing import clean_text
from .ocr.ocr_router import get_document_text


INPUT_FOLDER = Path("data/raw")
OUTPUT_FOLDER = Path("data/processed")


def _resolve_contract_id(pdf_path: str | Path) -> int | None:
    path = Path(pdf_path)
    pdf_files = sorted(INPUT_FOLDER.glob("*.pdf"))

    for index, candidate in enumerate(pdf_files, start=1):
        if candidate.resolve() == path.resolve():
            return index

    return None


def _build_document_result(
    pdf_path: str | Path,
    contract_id: int | None,
) -> dict:
    pages = get_document_text(pdf_path)

    cleaned_pages = [
        {
            "page_number": page["page_number"],
            "text": clean_text(page["text"]),
        }
        for page in pages
    ]

    full_text = clean_text(
        " ".join(
            page["text"]
            for page in cleaned_pages
            if page["text"]
        )
    )

    return {
        "contract_id": contract_id,
        "full_text": full_text,
        "pages": cleaned_pages,
    }


def run_full_pipeline(
    pdf_path: str | Path,
    output_folder: str | Path = OUTPUT_FOLDER,
    contract_id: int | None = None,
) -> dict:
    """
    Run extraction, section detection, and JSON saving for one PDF.
    """

    resolved_contract_id = contract_id if contract_id is not None else _resolve_contract_id(pdf_path)
    result = _build_document_result(pdf_path, resolved_contract_id)

    output_path = Path(output_folder) / f"{Path(pdf_path).stem}.json"
    save_result_to_json(result=result, output_path=output_path)

    return result

# Call process_document(pdf_path) to get the page-based JSON result.
def process_document(
    pdf_path: str | Path,
    contract_id: int | None = None,
) -> dict:
    """
    Backward-compatible wrapper around the full pipeline.
    """

    return _build_document_result(pdf_path, contract_id)