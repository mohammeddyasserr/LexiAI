import json
from pathlib import Path
from typing import Tuple

from ai_modules.rag_system.schemas import (
    DocumentInput,
    LegalInfo,
)

# ======================================================
# Demo Data Directory
# ======================================================

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "demo"


# ======================================================
# Member 1
# ======================================================

def load_member1_data() -> DocumentInput:
    """
    Load document data produced by Member 1.
    """

    file_path = DATA_DIR / "member1.json"

    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return DocumentInput(**data)


# ======================================================
# Member 2
# ======================================================

def load_member2_data() -> LegalInfo:
    """
    Load legal analysis produced by Member 2.
    """

    file_path = DATA_DIR / "member2.json"

    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return LegalInfo(**data)


# ======================================================
# Combined Loader
# ======================================================

def load_demo_data() -> Tuple[DocumentInput, LegalInfo]:
    """
    Load both Member 1 and Member 2 outputs.
    """

    document = load_member1_data()

    legal_info = load_member2_data()

    return document, legal_info