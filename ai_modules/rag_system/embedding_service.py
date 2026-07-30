from typing import List

from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """
    Centralized Embedding Service.

    Responsible for generating embeddings for:
        - Chunks
        - Clauses
        - Queries
        - Any legal text

    This class loads the embedding model only once and
    exposes simple methods for the rest of the RAG system.
    """

    def __init__(
        self,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    ):

        self.model_name = model_name

        self.model = SentenceTransformer(model_name)

    # ======================================================
    
    def embed_text(self, text: str):
        """
        Generate embedding for a single text.
        """

        return self.model.encode(
            text,
            convert_to_numpy=True
        )

    # ======================================================

    def embed_documents(
        self,
        texts: List[str]
    ):
        """
        Generate embeddings for multiple texts.
        """

        return self.model.encode(
            texts,
            convert_to_numpy=True
        )

    # ======================================================

    def get_dimension(self) -> int:
        """
        Returns embedding vector dimension.
        """

        return self.model.get_embedding_dimension()

    # ======================================================

    def get_model_name(self) -> str:
        """
        Returns current embedding model name.
        """

        return self.model_name