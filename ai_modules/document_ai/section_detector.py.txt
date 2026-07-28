import re
from typing import Any


# ============================================================
# Patterns
# ============================================================
ARTICLE_PATTERN = re.compile(r"^\s*ARTICLE\s+([IVXLCDM]+|\d+)\s*[\.\-:]?\s*(.*?)\s*$",re.IGNORECASE,)
SECTION_PATTERN = re.compile(r"^\s*SECTION\s+(\d+(?:\.\d+)*)\s*[\.\-:]?\s*(.*?)\s*$",re.IGNORECASE,)
DECIMAL_PATTERN = re.compile(r"^\s*(\d+\.\d+(?:\.\d+)*)\s*[\.\)]?\s+(.+?)\s*$")
INTEGER_PATTERN = re.compile(r"^\s*(\d+)\s*[\.\)]\s+(.+?)\s*$")
TOC_LINE_PATTERN = re.compile(
    r"(?:\.{3,}|\s{4,})\s*(?:\d+|[ivxlcdm]+)\s*$",
    re.IGNORECASE,
)
ISOLATED_HEADING_PATTERN = re.compile(
    r"^\s*(?:ARTICLE|SECTION)?\s*(?:\d+(?:\.\d+)*|[IVXLCDM]+)\s*[\.\-:]?\s*$",
    re.IGNORECASE,
)
PAGE_NUMBER_PATTERN = re.compile(r"^\s*(?:-\s*)?\d+(?:\s*-)?\s*$")
SOURCE_LINE_PATTERN = re.compile(r"^\s*source\s*:",re.IGNORECASE,)
# ============================================================
# Simple title filtering
# ============================================================
BAD_TITLE_PHRASES = (
    " shall ",
    " hereby ",
    " means ",
    " agrees to ",
    " agree to ",
    " pursuant to ",
    " provided that ",
    " subject to ",
    " notwithstanding ",
    " in accordance with ",
    " including ",
)
BAD_TITLE_STARTS = (
    "hereof",
    "thereof",
    "herein",
    "thereto",
    "thereunder",
    "hereunder",
    "whereas",
    "provided",
    "pursuant",
    "subject to",
)

ADDRESS_WORDS = (
    "street",
    "road",
    "avenue",
    "boulevard",
    "suite",
    "floor",
    "drive",
    "lane",
    "plaza",
    "building",
    "room",
)


def clean_line(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()
def clean_title(title: str) -> str:
    return title.strip().rstrip(" .:-–—")
def is_toc_page(text: str) -> bool:
    """
    A page is probably a table of contents when it contains
    several TOC-style lines ending with page numbers.
    """
    hits = 0

    for line in text.splitlines():
        if re.search(
            r"(?:\.{3,}|\s{4,})\s*(?:\d+|[ivxlcdm]+)\s*$",
            line.strip(),
            re.IGNORECASE,
        ):
            hits += 1

    return hits >= 4
def is_valid_title(title: str) -> bool:
    title = clean_title(title)

    if not title:
        return False

    if len(title) > 140:
        return False

    words = title.split()

    if len(words) > 16:
        return False

    if not any(char.isalpha() for char in title):
        return False

    lowered = title.lower()
    padded = f" {lowered} "

    if lowered.startswith(BAD_TITLE_STARTS):
        return False

    if any(phrase in padded for phrase in BAD_TITLE_PHRASES):
        return False

    if any(re.search(rf"\b{re.escape(word)}\b", lowered) for word in ADDRESS_WORDS):
        return False

    return True

def split_title_from_paragraph(title: str) -> str:
    """
    Handles lines such as:
        2. Employment. The Company hereby agrees ...

    It keeps only:
        Employment

    The split is conservative and only happens when the text after
    the first period looks like paragraph language.
    """
    title = clean_title(title)

    parts = re.split(r"\.\s+", title, maxsplit=1)

    if len(parts) == 2:
        first, rest = parts
        rest_lower = f" {rest.lower()} "

        if any(phrase in rest_lower for phrase in BAD_TITLE_PHRASES):
            return clean_title(first)

    return title


# ============================================================
# Candidate detection
# ============================================================

def detect_heading(line: str) -> dict[str, Any] | None:
    if TOC_LINE_PATTERN.search(line):
        return None

    match = ARTICLE_PATTERN.match(line)
    if match:
        title = match.group(2) or f"ARTICLE {match.group(1)}"
        title = split_title_from_paragraph(title)

        if is_valid_title(title):
            return {
                "kind": "article",
                "number": match.group(1),
                "title": title,
            }

    match = SECTION_PATTERN.match(line)
    if match:
        title = match.group(2) or f"SECTION {match.group(1)}"
        title = split_title_from_paragraph(title)

        if is_valid_title(title):
            return {
                "kind": "section",
                "number": match.group(1),
                "title": title,
            }

    # Decimal must be checked before integer.
    match = DECIMAL_PATTERN.match(line)
    if match:
        title = split_title_from_paragraph(match.group(2))

        if is_valid_title(title):
            return {
                "kind": "decimal",
                "number": match.group(1),
                "title": title,
            }

    match = INTEGER_PATTERN.match(line)
    if match:
        title = split_title_from_paragraph(match.group(2))

        if is_valid_title(title):
            return {
                "kind": "integer",
                "number": match.group(1),
                "title": title,
            }

    return None

# ============================================================
# Heading hierarchy selection
# ============================================================

def decimal_depth(number: str) -> int:
    return number.count(".") + 1

def choose_heading_system(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    articles = [c for c in candidates if c["kind"] == "article"]
    if articles:
        return articles

    section_integers = [
        c for c in candidates
        if c["kind"] == "section" and "." not in c["number"]
    ]
    if section_integers:
        return section_integers

    integers = [c for c in candidates if c["kind"] == "integer"]
    if integers:
        return integers

    decimals = [
        c for c in candidates
        if c["kind"] == "decimal" or (c["kind"] == "section" and "." in c["number"])
    ]
    if not decimals:
        return []

    min_depth = min(decimal_depth(c["number"]) for c in decimals)
    return [c for c in decimals if decimal_depth(c["number"]) == min_depth]
# ============================================================
# Main function
# ============================================================

def find_sections(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Input:
        [
            {
                "page_number": 1,
                "text": "..."
            }
        ]

    Output:
        [
            {
                "title": "DEFINITIONS",
                "page": 2,
                "text": "..."
            }
        ]
    """

    lines: list[dict[str, Any]] = []

    # --------------------------------------------------------
    # Flatten pages and remove TOC / page numbers / source lines
    # --------------------------------------------------------
    for fallback_page_number, page in enumerate(pages, start=1):
        text = str(page.get("text", "") or "")

        if is_toc_page(text):
            continue

        page_number = page.get("page_number", fallback_page_number)

        raw_lines = text.splitlines()
        index = 0

        while index < len(raw_lines):
            raw_line = raw_lines[index]
            line = clean_line(raw_line)

            if not line:
                index += 1
                continue

            if PAGE_NUMBER_PATTERN.match(line):
                index += 1
                continue

            if SOURCE_LINE_PATTERN.match(line):
                index += 1
                continue

            # Merge headings that were split across two physical lines.
            if ISOLATED_HEADING_PATTERN.match(line):
                for next_index in range(index + 1, len(raw_lines)):
                    next_line = clean_line(raw_lines[next_index])

                    if not next_line:
                        continue

                    if PAGE_NUMBER_PATTERN.match(next_line):
                        continue

                    if SOURCE_LINE_PATTERN.match(next_line):
                        continue

                    line = f"{line} {next_line}"
                    index = next_index
                    break

            lines.append(
                {
                    "text": line,
                    "page": page_number,
                }
            )

            index += 1

    # --------------------------------------------------------
    # Detect all possible headings
    # --------------------------------------------------------
    candidates: list[dict[str, Any]] = []

    for index, line_data in enumerate(lines):
        heading = detect_heading(line_data["text"])

        if heading is None:
            continue

        heading["page"] = line_data["page"]
        heading["start_index"] = index
        candidates.append(heading)

    # --------------------------------------------------------
    # Keep only one top-level heading system
    # --------------------------------------------------------
    selected = choose_heading_system(candidates)
    selected.sort(key=lambda item: item["start_index"])

    # --------------------------------------------------------
    # Remove duplicate headings
    # --------------------------------------------------------
    unique: list[dict[str, Any]] = []

    for candidate in selected:
        if (
            unique
            and candidate["title"].lower() == unique[-1]["title"].lower()
            and candidate["start_index"] - unique[-1]["start_index"] <= 2
        ):
            continue

        unique.append(candidate)

    # --------------------------------------------------------
    # Build section text
    # --------------------------------------------------------
    sections: list[dict[str, Any]] = []

    for index, section in enumerate(unique):
        start = section["start_index"] + 1

        if index + 1 < len(unique):
            end = unique[index + 1]["start_index"]
        else:
            end = len(lines)

        body = "\n".join(
            line["text"]
            for line in lines[start:end]
        ).strip()

        if body:
            sections.append(
                {
                    "title": section["title"],
                    "page": section["page"],
                    "text": body,
                }
            )

    if len(sections) < 3:
        print(
            f"[WARNING] Only {len(sections)} sections detected "
            "— check document format."
        )

    return sections