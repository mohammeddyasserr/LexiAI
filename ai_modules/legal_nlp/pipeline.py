from pathlib import Path

from .preprocessing import clean_text, split_sentences
from .section_detector import find_sections
from .entity_extractor import extract_entities

def sections_entities_pipeline(full_text) -> dict:

    full_text = clean_text(full_text)
    sentences = split_sentences(full_text)

    sections = find_sections(sentences)
    entities = extract_entities(full_text)

    return {
        "sections": sections,
        "entities": entities,
    }
