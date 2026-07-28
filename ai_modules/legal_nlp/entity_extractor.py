import re
from typing import Any

from .preprocessing import chunk_text


# ============================================================
# GLiNER (agilelab-org/Contractner) — primary extraction method
# ============================================================
# Model card: https://huggingface.co/agilelab-org/Contractner
# Fine-tuned GLiNER model specialized for legal/contract entity
# extraction (~72% F1 on held-out contract data, far above
# general-purpose regex or generic LLM extraction).
#
# Requires: pip install gliner
# Downloads the model from Hugging Face on first use (needs
# internet access to huggingface.co).

GLINER_MODEL_NAME = "agilelab-org/Contractner"
GLINER_THRESHOLD = 0.7
GLINER_CHUNK_MAX_CHARS = 800

# Shorter, more specific custom labels work better with this model
# than the raw training-schema label names (open-vocabulary NER is
# sensitive to how the label is phrased).
GLINER_LABELS = [
    "Company Name",
    "Contract Date",
    "Termination Date",
    "Duration",
    "Money Value",
    "Interest Rate",
    "Location",
]

# Maps the custom labels above to our simplified output schema.
GLINER_LABEL_MAP = {
    "Company Name": "Company",
    "Contract Date": "Date",
    "Termination Date": "Date",
    "Duration": "Duration",
    "Money Value": "Money",
    "Interest Rate": "Percentage",
    "Location": "Location",
}

# ============================================================
# Entity validation — sanity-checks applied to *every* extracted
# entity (both GLiNER and regex paths).
# ============================================================
# GLiNER is a zero-shot / open-vocabulary model: it sometimes tags
# a section *label* (e.g. "Contract Value", "Interest Rate") as if
# it were the value itself, instead of the actual amount that
# follows it. It can also miss the digits on a Duration span and
# return just the unit word. These checks reject any entity whose
# value doesn't actually look like the type it was tagged as, so
# a bad model prediction is dropped instead of leaking into the
# final output.

MONEY_PATTERN = re.compile(
    r"(?:USD|EGP|US\$|\$|€|£)\s?\d[\d,]*(?:\.\d+)?"
    r"|\d[\d,]*(?:\.\d+)?\s?(?:USD|EGP|EUR|dollars?|pounds?|euros?)",
    re.IGNORECASE,
)
DURATION_VALUE_PATTERN = re.compile(
    r"\d+\s*(?:calendar\s+)?(?:day|days|month|months|year|years)",
    re.IGNORECASE,
)
PERCENTAGE_VALUE_PATTERN = re.compile(r"\d+(?:\.\d+)?\s?%|\bpercent\b", re.IGNORECASE)
DATE_VALUE_PATTERN = re.compile(
    r"\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}"
    r"|\b\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{2,4}\b"
    r"|\b[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}\b",
)

# Type -> pattern that a value MUST match to be kept. Types not
# listed here (e.g. Company, Location) aren't checked this way,
# since their valid values aren't reducible to a simple pattern.
ENTITY_VALUE_VALIDATORS: dict[str, re.Pattern] = {
    "Money": MONEY_PATTERN,
    "Duration": DURATION_VALUE_PATTERN,
    "Percentage": PERCENTAGE_VALUE_PATTERN,
    "Date": DATE_VALUE_PATTERN,
}


def _is_valid_entity_value(entity_type: str, value: str) -> bool:
    validator = ENTITY_VALUE_VALIDATORS.get(entity_type)

    if validator is None:
        return True

    return bool(validator.search(value))


def _filter_valid_entities(entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        entity for entity in entities
        if _is_valid_entity_value(entity["type"], entity["value"])
    ]


_gliner_model = None
_gliner_import_error: Exception | None = None

try:
    from gliner import GLiNER  # type: ignore
except ImportError as exc:  # pragma: no cover - depends on environment
    GLiNER = None  # type: ignore
    _gliner_import_error = exc


def _get_gliner_model():
    global _gliner_model

    if GLiNER is None:
        raise RuntimeError(
            "The 'gliner' package is not installed. Run: pip install gliner"
        ) from _gliner_import_error

    if _gliner_model is None:
        _gliner_model = GLiNER.from_pretrained(GLINER_MODEL_NAME)

    return _gliner_model


def _predict_chunk(
    model,
    chunk: str,
    labels: list[str],
    label_map: dict[str, str],
    threshold: float,
) -> list[dict[str, Any]]:
    raw_entities = model.predict_entities(chunk, labels, threshold=threshold)

    mapped: list[dict[str, Any]] = []

    for entity in raw_entities:
        value = str(entity.get("text", "")).strip()
        raw_label = str(entity.get("label", "")).strip()
        score = float(entity.get("score", 0.0))

        if not value or not raw_label:
            continue

        mapped.append({
            "type": label_map.get(raw_label, raw_label),
            "value": value,
            "score": score,
        })

    return mapped


def extract_entities_gliner(
    text: str,
    labels: list[str] = GLINER_LABELS,
    label_map: dict[str, str] = GLINER_LABEL_MAP,
    threshold: float = GLINER_THRESHOLD,
    max_chunk_chars: int = GLINER_CHUNK_MAX_CHARS,
) -> list[dict[str, Any]]:
    """
    Extract entities using the agilelab-org/Contractner GLiNER model.

    The text is split into sentence-aware chunks before being sent
    to the model, since GLiNER has a 384-token context window and
    silently truncates longer inputs (documented on the model card).
    Duplicate entities found across overlapping chunks are merged,
    keeping the highest-confidence occurrence.

    Output:
        [
            {"type": "Company", "value": "ABC Ltd"},
            {"type": "Percentage", "value": "5%"},
            ...
        ]
    """

    model = _get_gliner_model()
    chunks = chunk_text(text, max_chars=max_chunk_chars) or [text]

    best_by_key: dict[tuple[str, str], dict[str, Any]] = {}

    for chunk in chunks:
        for entity in _predict_chunk(model, chunk, labels, label_map, threshold):
            key = (entity["type"].lower(), entity["value"].lower())

            if key not in best_by_key or entity["score"] > best_by_key[key]["score"]:
                best_by_key[key] = entity

    entities = [
        {"type": entity["type"], "value": entity["value"]}
        for entity in best_by_key.values()
    ]

    return _filter_valid_entities(entities)


# ============================================================
# Regex-based extraction — fallback when GLiNER / internet
# access to Hugging Face is unavailable.
# ============================================================
COMPANY_STOPWORDS = (
    "a", "an", "the", "this", "that", "these", "those", "is", "are", "was",
    "were", "be", "been", "being", "made", "between", "and", "or", "of",
    "in", "on", "at", "to", "for", "with", "by", "agreement", "shall",
    "party", "parties", "either", "hereby", "herein", "hereof",
)
_STOPWORD_LOOKAHEAD = rf"(?!(?:{'|'.join(COMPANY_STOPWORDS)})\b)"
_NAME_WORD = rf"{_STOPWORD_LOOKAHEAD}[A-Za-z][A-Za-z&\.\-]*"

COMPANY_SUFFIX_PATTERN = re.compile(
    rf"\b((?:{_NAME_WORD}\s+){{0,3}}{_NAME_WORD}"
    r"\s+(?:Ltd|LLC|Inc|Corp|Corporation|Company|Co)\.?)\b",
    re.IGNORECASE,
)
DURATION_PATTERN = re.compile(
    r"\b(\d+\s+(?:calendar\s+)?(?:day|days|month|months|year|years))\b",
    re.IGNORECASE,
)
PERCENTAGE_PATTERN = re.compile(r"(?<!\w)(\d+(?:\.\d+)?\s?%)")


def _smart_title(name: str) -> str:
    """
    Capitalize each word, but leave words that are already fully
    uppercase (likely acronyms, e.g. "ABC", "XYZ") untouched.
    """

    words = []

    for word in name.split():
        if word.isupper():
            words.append(word)
        else:
            words.append(word.capitalize())

    return " ".join(words)


def _unique_ordered(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for value in values:
        normalized = value.strip()
        key = normalized.lower()

        if not normalized or key in seen:
            continue

        seen.add(key)
        result.append(normalized)

    return result


def extract_entities_regex(text: str) -> list[dict[str, Any]]:
    """
    Lightweight regex-based fallback extraction.

    Output:
        [
            {"type": "Company", "value": "ABC Ltd"},
            {"type": "Duration", "value": "30 days"},
            {"type": "Percentage", "value": "5%"},
            ...
        ]
    """

    if not text:
        return []

    entities: list[dict[str, Any]] = []

    companies = _unique_ordered(COMPANY_SUFFIX_PATTERN.findall(text))
    for company in companies:
        entities.append({"type": "Company", "value": _smart_title(company)})

    durations = _unique_ordered(DURATION_PATTERN.findall(text))
    for duration in durations:
        entities.append({"type": "Duration", "value": duration})

    percentages = _unique_ordered(PERCENTAGE_PATTERN.findall(text))
    for percentage in percentages:
        entities.append({"type": "Percentage", "value": percentage.replace(" ", "")})

    money_values = _unique_ordered(MONEY_PATTERN.findall(text))
    for money in money_values:
        entities.append({"type": "Money", "value": money})

    return entities


# ============================================================
# Main entry point
# ============================================================

def extract_entities(text: str, use_gliner: bool = True) -> list[dict[str, Any]]:
    """
    Extract entities from the full contract text.

    Tries the GLiNER (agilelab-org/Contractner) model first for
    higher accuracy. Falls back to the regex-based extractor if
    the model/library is unavailable or the call fails for any
    reason (e.g. no internet access, package not installed).
    """

    if not text:
        return []

    if use_gliner:
        try:
            return extract_entities_gliner(text)
        except Exception as exc:
            print(
                f"[WARNING] GLiNER extraction unavailable ({exc}); "
                "falling back to regex-based extraction."
            )

    return extract_entities_regex(text)
