from typing import List, Optional
from pydantic import BaseModel


# ======================================================
# Member 1 - Document Extraction
# ======================================================

class Page(BaseModel):
    page_number: int
    text: str


class DocumentInput(BaseModel):
    contract_id: str
    full_text: str
    pages: List[Page]


# ======================================================
# Member 2 - Legal Analysis
# ======================================================

class Section(BaseModel):
    title: str
    page: int
    text: str


class Entity(BaseModel):
    type: str
    value: str


class LegalInfo(BaseModel):
    sections: List[Section]
    entities: List[Entity]


# ======================================================
# API Request
# ======================================================

class IndexContractRequest(BaseModel):
    document: DocumentInput
    legal_info: LegalInfo


# ======================================================
# Internal RAG Models
# ======================================================

class ChunkMetadata(BaseModel):
    contract_id: str
    page: int
    section: Optional[str] = None


class Chunk(BaseModel):
    text: str
    metadata: ChunkMetadata


class RetrievedChunk(BaseModel):
    text: str
    score: float
    metadata: ChunkMetadata


# ======================================================
# Chat
# ======================================================

class ChatRequest(BaseModel):
    contract_id: str
    question: str


class Source(BaseModel):
    page: int
    section: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    confidence: float
    sources: List[Source]