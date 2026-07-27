from pathlib import Path
from .extractor import extract_pages
from .preprocessing import clean_text
from .section_detector_old import find_sections


def process_document(
    pdf_path: str | Path,
    contract_id: int | None = None
) -> dict:
    """
    Process one PDF contract.

    contract_id is normally provided by the backend/database.
    During local testing, it may be None or a temporary number.
    """

    pages = extract_pages(pdf_path)

    # Clean each page separately
    cleaned_pages = []

    for page in pages:
        cleaned_pages.append({
            "page_number": page["page_number"],
            "text": clean_text(page["text"])
        })

    full_text = "\n\n".join(
        page["text"]
        for page in cleaned_pages
        if page["text"]
    )

    full_text = clean_text(full_text)

    sections = find_sections(cleaned_pages)

    return {
        "contract_id": contract_id,
        "full_text": full_text,
        "pages": cleaned_pages,
        "sections": sections
    }