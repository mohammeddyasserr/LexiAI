import re


NUMBERED_SECTION_PATTERN = re.compile(
    r"^\s*(\d{1,2})\.\s+(?:\([a-zA-Z]\)\s*)?(.+?\.)"
)

ARTICLE_SECTION_PATTERN = re.compile(
    r"^\s*(?:ARTICLE|SECTION)\s+(\d+)(?:\.\d+)*\.?\s+(.+?)\s*$",
    re.IGNORECASE
)


INVALID_TITLE_STARTS = (
    "hereof",
    "thereof",
    "herein",
    "thereto",
    "thereunder",
    "hereunder",
    "of the",
    "the foregoing",
    "provided",
    "pursuant",
    "subject to",
)


def is_valid_title(title: str) -> bool:
    """
    Reject sentence fragments that are not real section titles.
    """

    title = title.strip()

    if not title:
        return False

    if len(title) > 150:
        return False

    normalized_title = title.lower()

    if normalized_title.startswith(INVALID_TITLE_STARTS):
        return False

    # Main section titles normally begin with a capital letter
    if not title[0].isupper():
        return False

    return True


def detect_numbered_heading(line: str) -> dict | None:
    """
    Detect headings such as:

    1. Employment Term.
    3. (a) Base Salary. As compensation...
    """

    match = NUMBERED_SECTION_PATTERN.match(line)

    if not match:
        return None

    section_number = int(match.group(1))
    title = match.group(2).strip().rstrip(".")

    if not is_valid_title(title):
        return None

    remaining_text = line[match.end():].strip()

    return {
        "type": "numbered",
        "number": section_number,
        "title": title,
        "remaining_text": remaining_text
    }


def detect_article_heading(line: str) -> dict | None:
    """
    Detect headings such as:

    ARTICLE 1. DEFINITIONS
    SECTION 2. PAYMENT TERMS
    """

    match = ARTICLE_SECTION_PATTERN.match(line)

    if not match:
        return None

    article_number = int(match.group(1))
    title = match.group(2).strip().rstrip(".")

    # Ignore table-of-contents entries such as:
    # ARTICLE 1. DEFINITIONS 1
    # ARTICLE 20. INDEMNIFICATION 16
    if re.search(r"\s+\d+\s*$", title):
        return None

    if not is_valid_title(title):
        return None

    return {
        "type": "article",
        "number": article_number,
        "title": title,
        "remaining_text": ""
    }


def find_sections(pages: list[dict]) -> list[dict]:
    """
    Extract top-level sections from the document.

    Supports:
    - Numbered employment agreement headings
    - ARTICLE / SECTION lease headings
    """

    lines = []

    # Flatten page lines while preserving page numbers
    for page in pages:
        page_number = page["page_number"]

        for line in page["text"].splitlines():
            stripped_line = line.strip()

            if stripped_line:
                lines.append({
                    "text": stripped_line,
                    "page": page_number
                })

    article_candidates = []
    numbered_candidates = []

    # Find all possible headings
    for line_index, line_data in enumerate(lines):
        line = line_data["text"]

        article_heading = detect_article_heading(line)

        if article_heading is not None:
            article_candidates.append({
                **article_heading,
                "page": line_data["page"],
                "start_index": line_index
            })

        numbered_heading = detect_numbered_heading(line)

        if numbered_heading is not None:
            numbered_candidates.append({
                **numbered_heading,
                "page": line_data["page"],
                "start_index": line_index
            })

    # If the document contains ARTICLE headings, use ARTICLE headings only
    if article_candidates:
        detected_sections = article_candidates

    else:
        # Numbered contracts must follow:
        # 1, 2, 3, 4...
        # This prevents references and sentence fragments from
        # being detected as main sections.
        detected_sections = []
        expected_number = 1

        for candidate in numbered_candidates:
            if candidate["number"] == expected_number:
                detected_sections.append(candidate)
                expected_number += 1

    sections = []

    # Build the text for every detected section
    for index, section in enumerate(detected_sections):
        start_index = section["start_index"]

        if index + 1 < len(detected_sections):
            end_index = detected_sections[index + 1]["start_index"]
        else:
            end_index = len(lines)

        section_lines = []

        # Preserve text appearing after the heading on the same line
        if section["remaining_text"]:
            section_lines.append(section["remaining_text"])

        section_lines.extend(
            line_data["text"]
            for line_data in lines[start_index + 1:end_index]
        )

        sections.append({
            "title": section["title"],
            "page": section["page"],
            "text": "\n".join(section_lines).strip()
        })

    return sections