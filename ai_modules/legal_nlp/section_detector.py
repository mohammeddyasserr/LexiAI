from typing import Any


# ============================================================
# Clause type keywords
# ============================================================
# Substring matching (case-insensitive) instead of strict regex
# word-boundary patterns: simpler, and catches more phrasing
# variations (e.g. "late payment", "fine of") that a single regex
# pattern per category would miss.
CLAUSE_KEYWORDS: dict[str, list[str]] = {
    "Penalty": ["penalty", "penalties", "late payment", "liquidated damages", "fine of"],
    "Payment": ["payment shall", "invoice", "paid within", "payment terms", "amount due"],
    "Delivery": ["deliver", "delivery", "shipment", "shipped within", "goods shall"],
    "Termination": ["terminate", "termination", "written notice", "cancel this agreement"],
    "Confidentiality": ["confidential", "non-disclosure", "nda", "proprietary information"],
    "Liability": ["liable", "liability", "indemnify", "indemnification", "limitation of liability"],
    "GoverningLaw": ["governing law", "jurisdiction", "governed by the laws"],
    "ForceMajeure": ["force majeure", "act of god", "beyond reasonable control"],
    "Warranty": ["warrant", "warranty", "guarantee"],
    "DisputeResolution": ["arbitration", "dispute", "mediation"],
}


def classify_sentence(sentence: str) -> str | None:
    """
    Return the clause type that best matches a sentence, or None
    if no known keyword is found.
    """

    lowered = sentence.lower()

    for clause_type, keywords in CLAUSE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in lowered:
                return clause_type

    return None


def find_sections(sentences: list[str] | list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Input:
        sentences: list of cleaned sentences from the full contract text
                  (either as strings or dicts with 'text' and 'page no.')

    Output:
        [
            {
                "type": "Delivery",
                "text": "...",
                "page no.": "..."
            },
            ...
        ]
    """

    sections: list[dict[str, Any]] = []

    for item in sentences:
        if isinstance(item, dict):
            sentence = item.get("text", "")
            page_no = item.get("page no.", "")
        else:
            sentence = item
            page_no = ""

        clause_type = classify_sentence(sentence)

        if clause_type is None:
            continue

        sections.append(
            {
                "type": clause_type,
                "text": sentence,
                "page no.": page_no,
            }
        )

    if len(sections) < 3:
        print(
            f"[WARNING] Only {len(sections)} clause(s) detected "
            "— check document content."
        )

    return sections
