import re


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.strip()

    # Remove table-of-contents separator lines such as:
    # ----------- ---------------------------------------------
    text = re.sub(
        r"(?m)^\s*-{3,}(?:\s+-{3,})*\s*$",
        "",
        text
    )

    # Normalize spaces and tabs
    text = re.sub(r"[ \t]+", " ", text)

    # Remove spaces before line breaks
    text = re.sub(r" +\n", "\n", text)

    # Prevent excessive empty lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()