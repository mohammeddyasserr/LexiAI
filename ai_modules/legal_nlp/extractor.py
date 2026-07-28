import json
from pathlib import Path


def extract_input(json_path: str | Path) -> dict:
    """
    Load the input document.

    Expected structure (only these two fields are used):
        {
            "contract_id": 12,
            "full_text": "..."
        }

    Args:
        json_path: Path to the input JSON file.

    Returns:
        Dictionary with "contract_id" and "full_text".
    """

    path = Path(json_path)

    if not path.exists():
        raise FileNotFoundError(f"Input file not found: {path}")

    if path.suffix.lower() != ".json":
        raise ValueError("The provided file must be a JSON file.")

    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if "full_text" not in data:
        raise ValueError("Input JSON must contain a 'full_text' field.")

    return {
        "contract_id": data.get("contract_id"),
        "full_text": data["full_text"],
    }
