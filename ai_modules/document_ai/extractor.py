from pathlib import Path
import fitz


def extract_pages(pdf_path: str | Path) -> list[dict]:
    """
    Extract text from each PDF page.

    Args:
        pdf_path: Path to the PDF file.

    Returns:
        List of dictionaries containing page number and page text.
    """

    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError("The provided file must be a PDF.")

    pages = []

    with fitz.open(path) as document:
        for page_number, page in enumerate(document, start=1):
            text = page.get_text("text").strip()

            pages.append(
                {
                    "page_number": page_number,
                    "text": text
                }
            )

    return pages

