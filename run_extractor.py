import json
from pathlib import Path
from ai_modules.document_ai.extractor import extract_pages
from ai_modules.document_ai.preprocessing import clean_text
from ai_modules.document_ai.section_detector import find_sections


input_folder = Path("data/raw")
output_folder = Path("data/processed")

pdf_files = sorted(input_folder.glob("*.pdf"))


def print_document_summary(
    pdf_name: str,
    output_path: Path,
    pages_count: int,
    sections: list[dict],
) -> None:
    print("=" * 72)
    print(f"File      : {pdf_name}")
    print(f"Saved to  : {output_path}")
    print(f"Pages     : {pages_count}")
    print(f"Sections  : {len(sections)}")

    if sections:
        first_section = sections[0]
        preview = first_section["text"][:150].replace("\n", " ").strip()
        print("First sec :")
        print(f"  Title   : {first_section['title']}")
        print(f"  Preview : {preview}")
    else:
        print("First sec : <none>")

for contract_id, pdf_path in enumerate(pdf_files, start=1):

    try:
        pages = extract_pages(pdf_path)

        cleaned_pages = []
        for page in pages:
            cleaned_pages.append(
                {
                    "page_number": page["page_number"],
                    "text": clean_text(page["text"]),
                }
            )

        full_text = clean_text(
            "\n\n".join(
                page["text"]
                for page in cleaned_pages
                if page["text"]
            )
        )

        result = {
            "contract_id": contract_id,
            "full_text": full_text,
            "pages": cleaned_pages,
            "sections": find_sections(cleaned_pages),
        }

        output_path = output_folder / f"{pdf_path.stem}.json"

        output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open("w", encoding="utf-8") as file:
            json.dump(
                result,
                file,
                ensure_ascii=False,
                indent=4,
            )

        print_document_summary(
            pdf_name=pdf_path.name,
            output_path=output_path,
            pages_count=len(result["pages"]),
            sections=result["sections"],
        )

    except Exception as error:
        print("=" * 72)
        print(f"File      : {pdf_path.name}")
        print(f"Status    : FAILED")
        print(f"Error     : {error}")