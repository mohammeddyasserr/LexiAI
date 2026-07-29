from typing import List, Optional

from ai_modules.rag_system.vector_store import VectorStore
from ai_modules.rag_system.services import vector_store as _shared_vector_store


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
        top_k: int = 15,
        similarity_threshold: float = 0.08,
    ):

        # Use the injected store, or fall back to the shared singleton
        self.vector_store = vector_store if vector_store is not None else _shared_vector_store
        self.top_k = top_k
        self.similarity_threshold = similarity_threshold

    # ======================================================

    def retrieve(
        self,
        question: str,
        top_k: Optional[int] = None,
        contract_id: Optional[str | int] = None,
    ) -> List:
        """
        Retrieve the most relevant chunks for the given question.

        Args:
            question:    The search query.
            top_k:       Override the default top_k limit.
            contract_id: If provided, restrict results to this contract only.
                         Pass this when you know which contract to query.
        """

        limit = top_k if top_k is not None else self.top_k

        results = self.vector_store.search(
            query=question,
            limit=limit,
            contract_id=contract_id,
        )

        # Log details before filtering
        print(f"[Retriever Debug] Query: '{question}'"
              + (f" | contract_id={contract_id}" if contract_id else ""))
        print(f"[Retriever Debug] Retrieved {len(results)} points before threshold filtering:")
        for idx, result in enumerate(results):
            score_val = result.score if getattr(result, "score", None) is not None else 0.0
            print(f"  - Point {idx}: Score {score_val:.4f} | Chunk ID: {result.payload.get('chunk_id')} | contract_id: {result.payload.get('contract_id')}")

        filtered_results = [
            result
            for result in results
            if getattr(result, "score", None) is not None
            and result.score >= self.similarity_threshold
        ]

        # Log details after filtering
        print(f"[Retriever Debug] {len(filtered_results)} points remaining after similarity_threshold ({self.similarity_threshold}) filtering:")
        for idx, result in enumerate(filtered_results):
            print(f"  - Filtered Point {idx}: Score {result.score:.4f} | Chunk ID: {result.payload.get('chunk_id')} | contract_id: {result.payload.get('contract_id')}")

        return filtered_results