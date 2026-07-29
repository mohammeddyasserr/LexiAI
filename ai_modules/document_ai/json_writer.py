import json
from pathlib import Path


def save_result_to_json(result: dict, output_path: str | Path) -> None:


    path = Path(output_path)

    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8") as file:
        json.dump(
            result,
            file,
            ensure_ascii=False,
            indent=4
        )