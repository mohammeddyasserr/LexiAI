import re
from typing import Any


# ============================================================
# Clause type keywords
# ============================================================
# Substring matching (case-insensitive) instead of strict regex
# word-boundary patterns: simpler, and catches more phrasing
# variations (e.g. "late payment", "fine of") that a single regex
# pattern per category would miss.
CLAUSE_KEYWORDS = {
    "Penalty": [
        r"\bpenalty\b",
        r"\bpenalties\b",
        r"late payment",
        r"liquidated damages",
        r"fine of",
    ],

    "Payment": [
        r"\bpayment\b",
        r"payment terms",
        r"payment shall",
        r"shall pay",
        r"\bpayable\b",
        r"\binvoice\b",
        r"amount due",
        r"\bfees?\b",
        r"purchase price",
        r"\bconsideration\b",
        r"\bcompensation\b",
    ],

    "Delivery": [
        r"\bdelivery\b",
        r"\bdeliver\b",
        r"\bshipment\b",
        r"goods shall",
    ],

    "Termination": [
        r"\btermination\b",
        r"\bterminate\b",
        r"written notice",
        r"notice period",
        r"30 days",
        r"cancel this agreement",
        r"\bexpiration\b",
    ],

    "Confidentiality": [
        r"\bconfidential\b",
        r"non-disclosure",
        r"\bnda\b",
        r"proprietary information",
    ],

    "Liability": [
        r"\bliability\b",
        r"\bliable\b",
        r"\bindemnify\b",
        r"\bindemnification\b",
        r"hold harmless",
        r"limitation of liability",
    ],

  "GoverningLaw": [
    r"governing law",
    r"governed by",
    r"governed in accordance with",
    r"laws of",
    r"english law",
    r"state of",
    r"jurisdiction",
],

    "ForceMajeure": [
        r"force majeure",
        r"act of god",
        r"beyond reasonable control",
    ],
    "Warranty": [
        r"\bwarranty\b",
        r"\bwarranties\b",
        r"represents and warrants",
        r"representations and warranties",
        r"hereby represents",
        r"hereby warrants",
    ],

    "DisputeResolution": [
        r"\barbitration\b",
        r"\bmediation\b",
        r"dispute resolution",
    ],

   "Duration": [
    r"initial term",
    r"renewal term",
    r"effective date",
    r"term of this agreement",
    r"this agreement shall continue",
    r"this agreement shall remain",
    r"shall commence",
    r"commencement",
    r"expires",
]
}
# ============================================================
# Table of Contents (TOC) line filtering
# ============================================================
# Contracts commonly open with a table of contents where each
# line looks like: "Delivery of Content..................... 3"
# or "Termination..........................................5".
# Those lines contain clause keywords (e.g. "Delivery",
# "Termination") but are NOT actual clause text — they're just
# an index entry. Without filtering, classify_sentence() matches
# the keyword and the TOC line gets emitted as if it were a real
# section, duplicating/polluting the real section list.
#
# TOC lines are recognized by their distinctive shape: a run of
# repeated dots/dashes/underscores (a "leader") followed by a
# trailing page number, e.g.:
#   "Delivery of Content....................................... 3"
#   "Termination----------------------------------------------5"
TOC_LINE_PATTERN = re.compile(
    r".*\.{3,}\s*\d+(\s+\d+\.?)?\s*$",
    re.IGNORECASE,
)


def _is_toc_line(sentence: str) -> bool:
    """
    Return True if `sentence` looks like a table-of-contents
    entry (title + dot/dash leader + page number) rather than
    actual clause text.
    """

    return bool(TOC_LINE_PATTERN.search(sentence))


def classify_sentence(sentence: str):

    lowered = sentence.lower()

    scores = {}

    for clause_type, patterns in CLAUSE_KEYWORDS.items():

        score = 0

        for pattern in patterns:

            if re.search(pattern, lowered):
                score += 1

        if score:
            scores[clause_type] = score

    if not scores:
        return None

    return max(scores, key=scores.get)

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

        # Skip table-of-contents entries before classification so
        # they never get emitted as (fake) sections.
        if _is_toc_line(sentence):
            continue

        if len(sentence.split()) < 5:
            continue

        clause_type = classify_sentence(sentence)

        if clause_type is None:
            continue

        existing = next(
            (s for s in sections if s["type"] == clause_type),
              None,
        )

        if existing:
              existing["text"] += " " + sentence
        else:
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
