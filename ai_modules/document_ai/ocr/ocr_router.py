"""Simple document page routing.

This module decides whether a document should use native PDF extraction or OCR
and always returns a page-based structure.
"""
from __future__ import annotations
import tempfile
from pathlib import Path
import fitz
from ..extractor import extract_pages
from .ocr_provider import extract_text_from_image


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"}
MIN_TEXT_LENGTH = 20


def _is_image_file(document_path: Path) -> bool:
    """Return True when the document looks like an image file."""
    return document_path.suffix.lower() in IMAGE_EXTENSIONS

def _ocr_pdf_pages(document_path: Path) -> list[dict]:
    """Render PDF pages to images and run OCR on each rendered page."""
    extracted_pages: list[dict] = []

    with fitz.open(document_path) as document:
        for page_number, page in enumerate(document, start=1):
            pixmap = page.get_pixmap(matrix=fitz.Matrix(4, 4), alpha=False)

            with tempfile.NamedTemporaryFile(suffix=f"_page_{page_number}.png", delete=False) as temp_file:
                temp_path = Path(temp_file.name)

            try:
                pixmap.save(temp_path)
                page_text = extract_text_from_image(temp_path)

                if page_text:
                    extracted_pages.append(
                        {
                            "page_number": page_number,
                            "text": page_text,
                        }
                    )
            finally:
                if temp_path.exists():
                    temp_path.unlink(missing_ok=True)

    return extracted_pages

def get_document_text(document_path: str | Path) -> list[dict]:
    
    path = Path(document_path)

    if not path.exists():
        raise FileNotFoundError(f"Document not found: {path}")

    if _is_image_file(path):
        text = extract_text_from_image(path)
        return [
            {
                "page_number": 1,
                "text": text,
            }
        ] if text else []

    if path.suffix.lower() != ".pdf":
        raise ValueError("Unsupported file type. Expected a PDF or image file.")

    pages = extract_pages(path)
    extracted_text = "\n\n".join(page["text"] for page in pages if page["text"]).strip()
    if len(extracted_text) >= MIN_TEXT_LENGTH:
        return pages

    return _ocr_pdf_pages(path)
