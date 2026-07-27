from typing import List, Optional

from ai_modules.rag_system.vector_store import VectorStore


class Retriever:
    """
    Dense Retriever.

    Responsibilities:
        - Receive user question
        - Search the Vector Store
        - Filter weak matches
        - Return the most relevant chunks

    Future:
        - Hybrid Retrieval (Dense + BM25)
        - Metadata Filtering
        - Parent Document Retrieval
        - Query Expansion
        - Re-ranking
    """

    def __init__(
        self,
        vector_store: Optional[VectorStore] = None,
        top_k: int = 5,
        similarity_threshold: float = 0.30,
    ):

        self.vector_store = vector_store or VectorStore()
        self.top_k = top_k
        self.similarity_threshold = similarity_threshold

    # ======================================================

    def retrieve(
        self,
        question: str,
        top_k: Optional[int] = None,
    ) -> List:

        limit = top_k if top_k is not None else self.top_k

        results = self.vector_store.search(
            query=question,
            limit=limit,
        )

        filtered_results = [
            result
            for result in results
            if result.score >= self.similarity_threshold
        ]

        return filtered_results