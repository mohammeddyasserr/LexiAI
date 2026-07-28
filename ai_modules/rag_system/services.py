"""
Shared singleton services for the RAG system.

EmbeddingService and VectorStore are created once at application startup
and reused across all requests — both for indexing and question answering.

This prevents:
    - Multiple QdrantClient instances locking the same storage folder.
    - Multiple SentenceTransformer models being loaded into memory.
"""

from ai_modules.rag_system.embedding_service import EmbeddingService
from ai_modules.rag_system.vector_store import VectorStore


# ======================================================
# Shared EmbeddingService
# Loads the model once. Reused everywhere.
# ======================================================

embedding_service = EmbeddingService()


# ======================================================
# Shared VectorStore
# Opens one QdrantClient connection. Reused everywhere.
# ======================================================

vector_store = VectorStore(
    embedding_service=embedding_service
)
