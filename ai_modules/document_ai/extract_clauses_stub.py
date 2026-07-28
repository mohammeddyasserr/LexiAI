"""
TEMPORARY STUB for extract_clauses().

This is a placeholder so the rest of the pipeline (compare_clauses,
classify_clause_risk, generate_recommendation, build_final_response)
can be tested end-to-end while the real extract_clauses() is being
built by someone else on the team.

Expected real interface (confirm this matches what you get):

    extract_clauses(text: str) -> dict[str, dict | str]

    Input:
        text — the full raw contract text (output of extract_pages,
        joined into one string).

    Output:
        A dict keyed by the 8 comparison features, e.g.:

        {
            "Payment Terms": {"text": "..."},
            "Contract Duration": {"text": "..."},
            "Penalty Clause": {"text": "..."},
            "Warranty": {"text": "..."},
            "Liability": {"text": "..."},
            "Termination Notice": {"text": "..."},
            "Confidentiality": {"text": "..."},
            "Governing Law": {"text": "..."},
        }

    (Each value can also just be a plain string instead of a dict —
    both are supported downstream: response_builder.py and
    clause_comparison.py both handle dict-or-string clause values.)

DELETE THIS FILE once the real extract_clauses() is ready, and update
the import in analys_contarct.py to point to wherever your teammate
puts it.
"""

FEATURES = [
    "Payment Terms",
    "Contract Duration",
    "Penalty Clause",
    "Warranty",
    "Liability",
    "Termination Notice",
    "Confidentiality",
    "Governing Law",
]


def extract_clauses(text: str) -> dict:
    """
    STUB: returns a fixed-size chunk of the raw text under each
    feature name, just so downstream code has *something* to work
    with. Not a real extraction — do not use for real results.
    """

    print("[extract_clauses STUB] Using placeholder — not real clause extraction!")

    chunk_size = max(len(text) // len(FEATURES), 1) if text else 0

    clauses = {}
    for i, feature in enumerate(FEATURES):
        start = i * chunk_size
        end = start + chunk_size
        snippet = text[start:end].strip() if text else ""
        clauses[feature] = {"text": snippet or f"[no text found for {feature}]"}

    return clauses