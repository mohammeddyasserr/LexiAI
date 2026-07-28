from pathlib import Path

from .preprocessing import clean_text, split_sentences
from .section_detector import find_sections
from .entity_extractor import extract_entities

def sections_entities_pipeline(full_text, pages=None) -> dict:

    if pages:
        sentences = []
        for page in pages:
            p_no = page.get("page_number", "")
            p_text = clean_text(page.get("text", ""))
            p_sentences = split_sentences(p_text)
            for s in p_sentences:
                sentences.append({
                    "text": s,
                    "page no.": p_no
                })
    else:
        full_text = clean_text(full_text)
        sentences = split_sentences(full_text)

    sections = find_sections(sentences)
    entities = extract_entities(full_text)

    return {
        "sections": sections,
        "entities": entities,
    }
