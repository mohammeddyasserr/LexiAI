from dataclasses import dataclass, field
from typing import List, Dict, Any

from ai_modules.rag_system.schemas import (
    DocumentInput,
    LegalInfo,
)


# ======================================================
# Chunk Configuration
# ======================================================

@dataclass
class ChunkingConfig:
    """
    Configuration for the Smart Legal Chunker.
    """

    max_chunk_chars: int = 500
    min_chunk_chars: int = 100
    overlap_chars: int = 50

    preserve_sections: bool = True
    preserve_paragraphs: bool = True
    preserve_sentences: bool = True


# ======================================================
# Chunk Model
# ======================================================

@dataclass
class Chunk:
    """
    Represents one chunk stored in the Vector Database.
    """

    chunk_id: str

    parent_id: str

    contract_id: int

    page: int

    section: str

    text: str

    split_method: str

    start_char: int

    end_char: int

    importance: float = 0.0

    metadata: Dict[str, Any] = field(default_factory=dict)


# ======================================================
# Smart Legal Chunker
# ======================================================

class SmartLegalChunker:

    """
    Current Pipeline

    Document
        ↓
    Legal Sections
        ↓
    Paragraphs (Future)
        ↓
    Sentences (Future)
        ↓
    Token Chunking (Future)
        ↓
    Optimizer
        ↓
    Final Chunks
    """

    def __init__(self, config: ChunkingConfig = ChunkingConfig()):

        self.config = config

    # --------------------------------------------------

    def split_sections(
        self,
        legal_info: LegalInfo,
    ):

        return legal_info.sections

    # --------------------------------------------------

    def split_paragraphs(self, text: str):

        """
        Future:
        Split large sections into paragraphs.
        """

        return [text]

    # --------------------------------------------------

    def split_sentences(self, text: str):

        """
        Future:
        Split paragraphs into sentences.
        """

        return [text]

    # --------------------------------------------------

    def split_large_text(self, text: str):

        """
        Version 2

        If the section is larger than max_chunk_chars,
        split it into multiple chunks.

        Future:
            Token-based splitting
            Recursive splitting
            Semantic splitting
        """

        if len(text) <= self.config.max_chunk_chars:
            return [text]

        chunks = []

        start = 0

        while start < len(text):

            end = start + self.config.max_chunk_chars

            chunks.append(text[start:end])

            start = end - self.config.overlap_chars

        return chunks

    # --------------------------------------------------

    def optimize_chunks(self, chunks: List[Chunk]):

        """
        Future:
            Merge tiny chunks
            Remove duplicates
            Compute importance
        """

        return chunks

    # --------------------------------------------------

    def chunk_document(
        self,
        document: DocumentInput,
        legal_info: LegalInfo | None = None,
    ):

        chunks = []

        chunk_counter = 0

        for page in document.pages:

            texts = self.split_large_text(page.text)

            current_start = 0

            for text in texts:

                chunk = Chunk(

                    chunk_id=f"{document.contract_id}_{chunk_counter}",

                    parent_id=f"page_{page.page_number}",

                    contract_id=document.contract_id,

                    page=page.page_number,

                    section="",

                    text=text,

                    split_method="page",

                    start_char=current_start,

                    end_char=current_start + len(text),

                    importance=0.0,

                    metadata={},

                )

                chunks.append(chunk)

                current_start += len(text)

                chunk_counter += 1

        chunks = self.optimize_chunks(chunks)

        return chunks