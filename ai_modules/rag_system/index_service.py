from ai_modules.rag_system.schemas import DocumentInput, LegalInfo
from ai_modules.rag_system.chunking import SmartLegalChunker
from ai_modules.rag_system.metadata import MetadataEnricher
from ai_modules.rag_system.embedding_service import EmbeddingService
from ai_modules.rag_system.vector_store import VectorStore
from ai_modules.rag_system.services import (
    embedding_service as _shared_embedding_service,
    vector_store as _shared_vector_store,
)


def index_contract(
    document: DocumentInput,
    legal_info: LegalInfo,
    vector_store: VectorStore = None,
):
    """
    Exposes a public function to run the contract indexing workflow.
    """

    # 1. Chunking
    chunker = SmartLegalChunker()
    chunks = chunker.chunk_document(document, legal_info)

    # 2. Metadata Builder — reuse the shared EmbeddingService
    enricher = MetadataEnricher(_shared_embedding_service)
    chunks = enricher.enrich(chunks, legal_info)

    # 3. VectorStore Upsert — use injected store, shared store, or create new one
    store = vector_store if vector_store is not None else _shared_vector_store
    store.add_chunks(chunks)

    return {
        "status": "success",
        "contract_id": document.contract_id,
        "indexed_chunks": len(chunks),
    }

