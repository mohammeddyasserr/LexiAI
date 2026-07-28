from pathlib import Path

from .extractor import extract_input
from .json_writer import save_result_to_json
from .preprocessing import clean_text, split_sentences
from .section_detector import find_sections
from .entity_extractor import extract_entities


INPUT_FOLDER = Path("data/processed")
OUTPUT_FOLDER = Path("data/classified")


def _build_document_result(input_path: str | Path) -> dict:
    data = extract_input(input_path)

    full_text = clean_text(data["full_text"])
    sentences = split_sentences(full_text)

    sections = find_sections(sentences)
    entities = extract_entities(full_text)

    return {
        "sections": sections,
        "entities": entities,
    }


def run_full_pipeline(
    input_path: str | Path,
    output_folder: str | Path = OUTPUT_FOLDER,
) -> dict:
    """
    Run classification, entity extraction, and JSON saving for one
    input document (contract_id + full_text only).
    """

    data = extract_input(input_path)
    contract_id = data.get("contract_id")

    result = _build_document_result(input_path)

    file_stem = str(contract_id) if contract_id is not None else Path(input_path).stem
    output_path = Path(output_folder) / f"{file_stem}.json"
    save_result_to_json(result=result, output_path=output_path)

    return result


def process_document(input_path: str | Path) -> dict:
    """
    Backward-compatible wrapper around the full pipeline.
    """

    return _build_document_result(input_path)
