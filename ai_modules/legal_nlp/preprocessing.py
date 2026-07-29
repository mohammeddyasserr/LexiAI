import re


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.strip()

    # Normalize spaces and tabs
    text = re.sub(r"[ \t]+", " ", text)

    # Remove spaces before line breaks
    text = re.sub(r" +\n", "\n", text)

    # Prevent excessive empty lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove SEC/EDGAR-style filing footers, e.g.
    # "Source: CC REAL ESTATE INCOME FUND-ADV, POS 8C, 12/5/2018"
    text = re.sub(r"(?m)^\s*Source:.*\d{1,2}/\d{1,2}/\d{2,4}\s*$", "", text)

    # Remove standalone page-number lines, e.g. "- 3 -"
    text = re.sub(r"(?m)^\s*-?\s*\d+\s*-?\s*$", "", text)

    return text.strip()


# ============================================================
# Sentence splitting — spaCy-based
# ============================================================
# Previously this used a hand-written regex
# (r"(?<=[\.\!\?])\s+(?=[A-Z0-9])") that split on ANY
# "punctuation + space + capital/digit" pattern. That broke on
# common abbreviations found in contracts (e.g. "Mr. Wang",
# "No. 5", "Art. 3", "Inc.", "Ltd."), splitting a single legal
# sentence into two fragments and corrupting downstream section
# classification.
#
# spaCy's sentence boundary detection is rule/parse-based and
# already knows how to handle standard abbreviations, so it's
# used here instead. The model is loaded lazily (once) since
# loading it is relatively expensive.
#
# Requires: pip install spacy
#           python -m spacy download en_core_web_sm

_nlp = None
_spacy_import_error: Exception | None = None

try:
    import spacy  # type: ignore
except ImportError as exc:  # pragma: no cover - depends on environment
    spacy = None  # type: ignore
    _spacy_import_error = exc

SPACY_MODEL_NAME = "en_core_web_sm"


def _get_nlp():
    global _nlp

    if spacy is None:
        raise RuntimeError(
            "The 'spacy' package is not installed. Run: pip install spacy "
            "&& python -m spacy download en_core_web_sm"
        ) from _spacy_import_error

    if _nlp is None:
        # Only the sentence boundary detection is needed here, so
        # heavier pipeline components (NER, parser-dependent tagging,
        # lemmatizer, etc.) are disabled for speed. The parser is kept
        # since it drives sentence segmentation.
        _nlp = spacy.load(
            SPACY_MODEL_NAME,
            exclude=["ner", "lemmatizer", "tagger", "attribute_ruler"],
        )

    return _nlp


def split_sentences(text: str) -> list[str]:
    """
    Split cleaned text into individual sentences using spaCy's
    sentence boundary detection.

    This correctly keeps things like "Mr. Wang Zhongming" or
    "Clause 3." together instead of treating the abbreviation's
    period as a sentence end (which a plain regex would do).
    """

    if not text:
        return []

    text = clean_text(text).replace("\n", " ")

    nlp = _get_nlp()
    doc = nlp(text)

    sentences = [clean_text(sent.text) for sent in doc.sents]

    return [sentence for sentence in sentences if sentence]


def chunk_text(text: str, max_chars: int = 800) -> list[str]:
    """
    Split text into chunks that stay under a character budget,
    without ever cutting a sentence in half.

    This exists because the GLiNER ContractNER model has a
    384-token context window: feeding it the full contract at
    once silently truncates entities near the end of the document
    (this is documented on the model card, especially affecting
    long clauses like "Act" and "Regulation"). Chunking keeps each
    call well within the model's window.
    """

    sentences = split_sentences(text)

    if not sentences:
        return []

    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for sentence in sentences:
        sentence_len = len(sentence)

        if current and current_len + 1 + sentence_len > max_chars:
            chunks.append(" ".join(current))
            current = []
            current_len = 0

        current.append(sentence)
        current_len += sentence_len + (1 if len(current) > 1 else 0)

    if current:
        chunks.append(" ".join(current))

    return chunks
