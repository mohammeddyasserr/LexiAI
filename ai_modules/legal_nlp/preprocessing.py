import re


SENTENCE_SPLIT_PATTERN = re.compile(r"(?<=[\.\!\?])\s+(?=[A-Z0-9])")


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

    return text.strip()


def split_sentences(text: str) -> list[str]:
    """
    Split cleaned text into individual sentences.
    """

    if not text:
        return []

    text = clean_text(text).replace("\n", " ")

    raw_sentences = SENTENCE_SPLIT_PATTERN.split(text)

    sentences = [clean_text(sentence) for sentence in raw_sentences]

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
