from pathlib import Path
from ai_modules.document_ai.pipeline import process_document
from ai_modules.document_ai.json_writer import save_result_to_json


input_folder = Path("data/raw")
output_folder = Path("data/processed")

contracts = [
    {
        "contract_id": 1,
        "pdf_path": input_folder / "employment1.pdf"
    },
    {
        "contract_id": 2,
        "pdf_path": input_folder / "employment2.pdf"
    },
    {
        "contract_id": 3,
        "pdf_path": input_folder / "lease1.pdf"
    }
]


for contract in contracts:
    pdf_path = contract["pdf_path"]
    contract_id = contract["contract_id"]

    try:
        result = process_document(
            pdf_path=pdf_path,
            contract_id=contract_id
        )

        output_path = output_folder / f"{pdf_path.stem}.json"

        save_result_to_json(
            result=result,
            output_path=output_path
        )

        print("=" * 60)
        print("File:", pdf_path.name)
        print("Contract ID:", result["contract_id"])
        print("Number of pages:", len(result["pages"]))
        print("Full text length:", len(result["full_text"]))
        print("Number of sections:", len(result["sections"]))
        print("Saved to:", output_path)

        print("First section titles:")

        for section in result["sections"][:5]:
            print(
                "-",
                section["title"],
                "| page:",
                section["page"]
            )

    except Exception as error:
        print("=" * 60)
        print("Failed file:", pdf_path.name)
        print("Error:", error)